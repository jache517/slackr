"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Dialog } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { Button, Card } from "@/components/ui";

/**
 * Step 1 of New Project. The summary panel mirrors the fields live, `Next`
 * stays blocked until both are filled, and Cancel goes through a confirm
 * dialog. The dialog covers the intent; the toast's `Undo` covers the
 * misclick, so a destructive action never rests on the confirmation alone.
 */

type Draft = { title: string; dueDate: string };

const EMPTY: Draft = { title: "", dueDate: "" };

/**
 * The draft the toast's `Undo` hands back. It only has to survive one
 * client-side navigation inside the same session - the toast is gone in ten
 * seconds - so a module binding is the whole mechanism. It is read once when
 * the form mounts and cleared immediately after.
 */
let pendingRestore: Draft | null = null;

function formatDue(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Field({
  id,
  label,
  help,
  error,
  children,
}: {
  id: string;
  label: string;
  help: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-body font-semibold text-ink-900">
          {label}
        </label>
        <span className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
          Required
        </span>
      </span>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-body text-red-700">
          {error}
        </p>
      ) : null}
      <p id={`${id}-help`} className="text-body text-ink-500">
        {help}
      </p>
    </div>
  );
}

const controlClass =
  "min-h-10 w-full rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-900 transition-colors duration-[120ms] hover:border-ink-700 aria-invalid:border-red-700";

export function NewProjectForm() {
  const router = useRouter();
  const showToast = useToast();

  const [draft, setDraft] = useState<Draft>(() => pendingRestore ?? EMPTY);
  const [errors, setErrors] = useState<Partial<Draft>>({});
  const [discarding, setDiscarding] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const dueRef = useRef<HTMLInputElement>(null);

  // A restored draft is consumed once, and focus lands where it left off.
  useEffect(() => {
    if (!pendingRestore) return;
    pendingRestore = null;
    titleRef.current?.focus();
  }, []);

  const title = draft.title.trim();
  const complete = title.length > 0 && draft.dueDate.length > 0;
  const blockedReason = complete ? undefined : "Fill in both fields to continue.";

  function submit() {
    const next: Partial<Draft> = {};
    if (!title) next.title = "Give the project a title.";
    if (!draft.dueDate) next.dueDate = "Choose a due date.";
    setErrors(next);

    if (next.title) {
      titleRef.current?.focus();
      return;
    }
    if (next.dueDate) {
      dueRef.current?.focus();
      return;
    }

    // Step 2 is not built yet, so the flow stops here rather than
    // pretending the project was created.
    showToast({ message: "Connecting tools is step 2, still to come." });
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

  const due = draft.dueDate ? formatDue(draft.dueDate) : null;

  return (
    <div className="grid grid-cols-[1fr_380px] items-start gap-6">
      <Card>
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-subhead font-semibold text-ink-900">
            Project details
          </h2>

          <Field
            id="project-title"
            label="Project title"
            help="Everyone you invite sees this title when they join."
            error={errors.title}
          >
            <input
              ref={titleRef}
              id="project-title"
              name="projectTitle"
              type="text"
              required
              autoComplete="off"
              value={draft.title}
              onChange={(event) => {
                setDraft((d) => ({ ...d, title: event.target.value }));
                setErrors((e) => ({ ...e, title: undefined }));
              }}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={
                errors.title ? "project-title-error" : "project-title-help"
              }
              className={controlClass}
            />
          </Field>

          <div className="max-w-70">
            <Field
              id="due-date"
              label="Due date"
              help="Reports cover today until this date."
              error={errors.dueDate}
            >
              <input
                ref={dueRef}
                id="due-date"
                name="dueDate"
                type="date"
                required
                value={draft.dueDate}
                onChange={(event) => {
                  setDraft((d) => ({ ...d, dueDate: event.target.value }));
                  setErrors((e) => ({ ...e, dueDate: undefined }));
                }}
                aria-invalid={errors.dueDate ? true : undefined}
                aria-describedby={
                  errors.dueDate ? "due-date-error" : "due-date-help"
                }
                className={controlClass}
              />
            </Field>
          </div>

          <hr className="border-0 border-t border-rule" />

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Button
                type="submit"
                disabledReason={blockedReason}
                aria-describedby={blockedReason ? "next-reason" : undefined}
              >
                Next: connect the tools
              </Button>
              <Button
                variant="secondary"
                aria-describedby="cancel-note"
                onClick={() => setDiscarding(true)}
              >
                Cancel
              </Button>
            </div>
            {blockedReason ? (
              <p id="next-reason" className="text-body text-ink-500">
                {blockedReason}
              </p>
            ) : null}
            <p id="cancel-note" className="text-body text-ink-500">
              Cancel discards this draft.
            </p>
          </div>
        </form>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            What you&apos;re creating
          </h2>

          <div aria-live="polite" className="flex flex-col gap-1">
            {title ? (
              <>
                <p className="text-section font-semibold text-ink-900">
                  {title}
                </p>
                <p className="text-body text-ink-500">
                  {due ? `Due ${due}` : "No due date yet"}
                </p>
              </>
            ) : (
              <p className="text-section font-semibold text-ink-500 italic">
                Not set yet
              </p>
            )}
          </div>

          <hr className="border-0 border-t border-rule" />
          <ul className="flex list-none flex-col gap-3 p-0">
            {[
              "No tools connected yet (step 2)",
              "Invite link is created at the end",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="size-4 shrink-0 rounded-full border-[1.5px] border-ink-300"
                />
                <span className="text-body text-ink-900">
                  <span className="mr-2 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                    Not started
                  </span>
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <hr className="border-0 border-t border-rule" />
          <p className="text-body text-ink-500">
            Nothing is collected until you connect at least one tool. You can
            change any of this later.
          </p>
        </div>
      </Card>

      <Dialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        title="Discard this draft?"
        body="The project title and due date will not be saved."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={discard}
      />
    </div>
  );
}
