"use client";

import { formatDue, type Draft } from "./draft";
import type { StepIndex } from "./steps";

/**
 * Step 4. The last point at which nothing has been written.
 *
 * Every line here is a value from an earlier step and says which step it came
 * from, so a wrong one is one click from being fixed rather than a reason to
 * start over.
 */

function Row({ label, value }: { label: string; value: string }) {
  const empty = value.length === 0;

  return (
    <div className="grid grid-cols-[180px_1fr] items-baseline gap-4">
      <dt className="text-body text-ink-500">{label}</dt>
      <dd
        className={`m-0 text-body ${empty ? "text-ink-500 italic" : "text-ink-900"}`}
      >
        {empty ? "Not set" : value}
      </dd>
    </div>
  );
}

function Section({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: StepIndex;
  onEdit: (step: StepIndex) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-tile border border-rule bg-surface-page p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
          {title}
        </h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="rounded-control px-2 py-1 text-body font-medium text-indigo-600 hover:bg-surface-card hover:underline underline-offset-2"
        >
          Edit
          <span className="sr-only"> {title.toLowerCase()}</span>
        </button>
      </div>
      {children}
    </section>
  );
}

export function ReviewStep({
  draft,
  failure,
  creating,
  onEdit,
}: {
  draft: Draft;
  failure: string | null;
  creating: boolean;
  onEdit: (step: StepIndex) => void;
}) {
  const due = draft.dueDate ? formatDue(draft.dueDate) : null;
  const withGithub = draft.members.filter((member) =>
    member.githubUsername.trim(),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-subhead font-semibold text-ink-900">Review</h2>
        <p className="text-body text-ink-500">
          Nothing has been created yet. Creating the project writes the members
          and connects the sources below.
        </p>
      </div>

      {failure ? (
        <p
          role="alert"
          className="rounded-control bg-tint-red px-3 py-2 text-body text-red-700"
        >
          {failure}
        </p>
      ) : null}

      <Section title="Project info" step={0} onEdit={onEdit}>
        <dl className="m-0 flex flex-col gap-2">
          <Row label="Title" value={draft.title.trim()} />
          <Row label="Deadline" value={due ?? ""} />
        </dl>
      </Section>

      <Section title="Members" step={1} onEdit={onEdit}>
        <p className="text-body text-ink-500">
          {draft.members.length}{" "}
          {draft.members.length === 1 ? "member" : "members"}, {withGithub} with
          a GitHub username linked.
        </p>
        <ul className="flex list-none flex-col gap-2 p-0">
          {draft.members.map((member) => {
            const identities = [
              member.githubUsername.trim(),
              member.googleEmail.trim(),
            ].filter(Boolean);

            return (
              <li
                key={member.key}
                className="grid grid-cols-[180px_1fr] items-baseline gap-4"
              >
                <span className="text-body font-semibold text-ink-900">
                  {member.name.trim()}
                </span>
                <span className="text-body text-ink-500">
                  {identities.length > 0
                    ? identities.join(" - ")
                    : "No identities linked yet"}
                </span>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Connect sources" step={2} onEdit={onEdit}>
        <dl className="m-0 flex flex-col gap-2">
          <Row label="GitHub repository" value={draft.githubUrl.trim()} />
          <Row label="Google Doc" value={draft.googleDocUrl.trim()} />
        </dl>
        {draft.googleDocUrl.trim() ? (
          <p className="text-body text-ink-500">
            You will be sent to Google to sign in and approve reading that
            document&apos;s activity once the project exists.
          </p>
        ) : null}
      </Section>

      <p aria-live="polite" className="text-body text-ink-500">
        {creating ? "Creating the project..." : null}
      </p>
    </div>
  );
}
