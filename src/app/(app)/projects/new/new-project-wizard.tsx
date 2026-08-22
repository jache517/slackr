"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { Button, Card } from "@/components/ui";

import { ConnectSourcesStep } from "./connect-sources-step";
import {
  emptyDraft,
  memberPayload,
  validateMembers,
  validateProjectInfo,
  validateSources,
  type Draft,
  type MemberErrors,
  type SourceErrors,
} from "./draft";
import { MembersStep } from "./members-step";
import { ProjectInfoStep } from "./project-info-step";
import { ReviewStep } from "./review-step";
import { Stepper } from "./stepper";
import { LAST_STEP, STEPS, type StepIndex } from "./steps";

/**
 * New Project, as four steps over one draft.
 *
 * Nothing is written until the last step, so `Back` is always free and
 * abandoning the flow costs nothing. Each `Next` runs that step's checks
 * first: the wizard will not carry a draft forward that the server would
 * reject at the end, when the fields are no longer on screen.
 */

/**
 * The draft the toast's `Undo` hands back. It only has to survive one
 * client-side navigation inside the same session - the toast is gone in ten
 * seconds - so a module binding is the whole mechanism. It is read once when
 * the wizard mounts and cleared immediately after.
 */
let pendingRestore: Draft | null = null;

type PostResult =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; message: string };

/**
 * One POST, with the API's own message carried back. The wizard shows what
 * the server said rather than a message of its own: the server knows why it
 * refused and the reader is the person who can act on it.
 */
async function post(url: string, body: unknown): Promise<PostResult> {
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, message: "The network request did not reach Slackr." };
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? ((payload.error as { message?: string })?.message ?? null)
        : null;
    return { ok: false, message: message ?? "The request could not be completed." };
  }

  return { ok: true, data: (payload?.data ?? {}) as Record<string, unknown> };
}

const NEXT_LABEL = [
  "Next: members",
  "Next: connect sources",
  "Next: review",
  "Create project",
] as const;

export function NewProjectWizard() {
  const router = useRouter();
  const showToast = useToast();

  const [step, setStep] = useState<StepIndex>(0);
  const [draft, setDraft] = useState<Draft>(() => pendingRestore ?? emptyDraft());
  const [infoErrors, setInfoErrors] = useState<{
    title?: string;
    dueDate?: string;
  }>({});
  const [memberErrors, setMemberErrors] = useState<Map<string, MemberErrors>>(
    new Map(),
  );
  const [sourceErrors, setSourceErrors] = useState<SourceErrors>({});
  const [discarding, setDiscarding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const fields = useRef(new Map<string, HTMLElement>());
  const panelRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  // A restored draft is consumed once, and the wizard reopens at step 1.
  useEffect(() => {
    if (!pendingRestore) return;
    pendingRestore = null;
    fields.current.get("project-title")?.focus();
  }, []);

  // After a step change the panel takes focus, so the next Tab starts inside
  // the step that just appeared rather than back at the top of the page.
  useEffect(() => {
    if (!movedRef.current) return;
    movedRef.current = false;
    panelRef.current?.focus();
  }, [step]);

  function registerField(id: string) {
    return (element: HTMLElement | null) => {
      if (element) fields.current.set(id, element);
      else fields.current.delete(id);
    };
  }

  function focusField(id: string) {
    fields.current.get(id)?.focus();
  }

  function change(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
    // Errors are cleared as soon as the reader edits: a message about a value
    // that is no longer on screen is just noise.
    setInfoErrors({});
    setMemberErrors(new Map());
    setSourceErrors({});
    setFailure(null);
  }

  function goTo(next: StepIndex) {
    movedRef.current = true;
    setStep(next);
  }

  /** Runs the current step's checks. Returns whether the draft may move on. */
  function checkCurrentStep() {
    if (step === 0) {
      const errors = validateProjectInfo(draft);
      setInfoErrors(errors);

      if (errors.title) {
        focusField("project-title");
        return false;
      }
      if (errors.dueDate) {
        focusField("due-date");
        return false;
      }
      return true;
    }

    if (step === 1) {
      const errors = validateMembers(draft.members);
      setMemberErrors(errors);

      if (errors.size === 0) return true;

      const index = draft.members.findIndex((member) => errors.has(member.key));
      const row = errors.get(draft.members[index].key) ?? {};
      const field = row.name
        ? "name"
        : row.email
          ? "email"
          : row.githubUsername
            ? "github"
            : "google";
      focusField(`member-${index}-${field}`);
      return false;
    }

    if (step === 2) {
      const errors = validateSources(draft);
      setSourceErrors(errors);

      if (errors.githubUrl) {
        focusField("github-url");
        return false;
      }
      if (errors.googleDocUrl) {
        focusField("google-doc-url");
        return false;
      }
      return true;
    }

    return true;
  }

  function next() {
    if (creating || !checkCurrentStep()) return;

    if (step === LAST_STEP) {
      void create();
      return;
    }

    goTo((step + 1) as StepIndex);
  }

  /**
   * The only write in the flow, and the only place the draft leaves the
   * browser. The project has to exist before members or sources can hang off
   * it, so a later failure leaves a real project behind: when that happens
   * the wizard says what did not land and drops the reader on the screen
   * where they can finish it, rather than reporting a clean success or
   * silently discarding the rest.
   */
  async function create() {
    setCreating(true);
    setFailure(null);

    const project = await post("/api/projects", {
      title: draft.title.trim(),
      deadline: draft.dueDate,
    });

    if (!project.ok) {
      setCreating(false);
      setFailure(`The project was not created: ${project.message}`);
      return;
    }

    const projectId = String(project.data.id);

    for (const member of draft.members) {
      const created = await post(
        `/api/projects/${projectId}/members`,
        memberPayload(member),
      );

      if (!created.ok) {
        setCreating(false);
        showToast({
          message: `${draft.title.trim()} was created, but ${member.name.trim()} was not added: ${created.message}`,
        });
        router.push(`/projects/${projectId}/members`);
        router.refresh();
        return;
      }
    }

    const githubUrl = draft.githubUrl.trim();

    if (githubUrl) {
      const connected = await post(
        `/api/projects/${projectId}/sources/github`,
        { repositoryUrl: githubUrl },
      );

      if (!connected.ok) {
        setCreating(false);
        showToast({
          message: `Project and members created. The repository was not connected: ${connected.message}`,
        });
        router.push(`/projects/${projectId}`);
        router.refresh();
        return;
      }
    }

    const googleDocUrl = draft.googleDocUrl.trim();

    if (googleDocUrl) {
      const intent = await post(`/api/projects/${projectId}/sources/google`, {
        documentUrl: googleDocUrl,
      });

      // Google will not hand over document activity without the owner saying
      // so, so the last thing the flow does is go and ask.
      if (intent.ok && typeof intent.data.authorizationUrl === "string") {
        window.location.assign(intent.data.authorizationUrl);
        return;
      }

      setCreating(false);
      showToast({
        message: intent.ok
          ? "Project created. Connect the Google Doc from the project when you are ready."
          : `Project created. The Google Doc was not connected: ${intent.message}`,
      });
      router.push(`/projects/${projectId}`);
      router.refresh();
      return;
    }

    setCreating(false);
    showToast({ message: `${draft.title.trim()} is ready.` });
    router.push(`/projects/${projectId}`);
    router.refresh();
  }

  function back() {
    if (creating || step === 0) return;
    goTo((step - 1) as StepIndex);
  }

  function discard() {
    const discarded = draft;
    setDiscarding(false);
    router.push("/projects");
    showToast({
      message: "Draft discarded.",
      onUndo: () => {
        pendingRestore = discarded;
        router.push("/projects/new");
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Stepper current={step} />

      <Card>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            next();
          }}
          className="flex flex-col gap-6"
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            aria-labelledby="step-heading"
            className="focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-4"
          >
            <span id="step-heading" className="sr-only">
              {`Step ${step + 1} of ${STEPS.length}: ${STEPS[step].heading}`}
            </span>

            {step === 0 ? (
              <ProjectInfoStep
                draft={draft}
                errors={infoErrors}
                onChange={change}
                registerField={registerField}
              />
            ) : null}

            {step === 1 ? (
              <MembersStep
                draft={draft}
                errors={memberErrors}
                onChange={change}
                registerField={registerField}
              />
            ) : null}

            {step === 2 ? (
              <ConnectSourcesStep
                draft={draft}
                errors={sourceErrors}
                onChange={change}
                registerField={registerField}
              />
            ) : null}

            {step === LAST_STEP ? (
              <ReviewStep
                draft={draft}
                failure={failure}
                creating={creating}
                onEdit={goTo}
              />
            ) : null}
          </div>

          <hr className="border-0 border-t border-rule" />

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              {step > 0 ? (
                <Button
                  variant="secondary"
                  onClick={back}
                  disabledReason={
                    creating ? "The project is being created." : undefined
                  }
                >
                  Back
                </Button>
              ) : null}
              <Button
                type="submit"
                aria-busy={creating || undefined}
                disabledReason={
                  creating ? "The project is being created." : undefined
                }
              >
                {creating ? "Creating..." : NEXT_LABEL[step]}
              </Button>
              <Button
                variant="quiet"
                aria-describedby="cancel-note"
                disabledReason={
                  creating ? "The project is being created." : undefined
                }
                onClick={() => {
                  if (!creating) setDiscarding(true);
                }}
              >
                Cancel
              </Button>
            </div>
            <p id="cancel-note" className="text-body text-ink-500">
              Nothing is created until the last step. Cancel discards this draft.
            </p>
          </div>
        </form>
      </Card>

      <Dialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        title="Discard this draft?"
        body="Everything you have filled in across the four steps will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={discard}
      />
    </div>
  );
}
