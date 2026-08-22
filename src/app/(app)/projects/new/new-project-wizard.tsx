"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { Button, Card } from "@/components/ui";

import {
  emptyDraft,
  validateMembers,
  validateProjectInfo,
  type Draft,
  type MemberErrors,
} from "./draft";
import { MembersStep } from "./members-step";
import { ProjectInfoStep } from "./project-info-step";
import { Stepper } from "./stepper";
import { STEPS, type StepIndex } from "./steps";

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
  const [discarding, setDiscarding] = useState(false);

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

    return true;
  }

  function next() {
    if (!checkCurrentStep()) return;

    if (step === 1) {
      // Steps 3 and 4 are not built yet, so the flow stops here rather than
      // pretending the project was created.
      showToast({ message: "Connecting sources is step 3, still to come." });
      return;
    }

    goTo((step + 1) as StepIndex);
  }

  function back() {
    if (step === 0) return;
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
          </div>

          <hr className="border-0 border-t border-rule" />

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              {step > 0 ? (
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
              ) : null}
              <Button type="submit">{NEXT_LABEL[step]}</Button>
              <Button
                variant="quiet"
                aria-describedby="cancel-note"
                onClick={() => setDiscarding(true)}
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
