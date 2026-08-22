"use client";

import { useRef, useState } from "react";

import { WarningIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { Button, Card, PageHeader } from "@/components/ui";
import type {
  MemberRecord,
  MemberRoleContextRecord,
  UnmatchedAccount,
} from "@/lib/data/queries";

/**
 * Members, with the match flow and the per-row account edit.
 *
 * Matching is reversible: the toast's `Undo` puts the account card back and
 * returns focus to the select it came from.
 *
 * The spec's match-failure state is not built. An unmatched account is by
 * definition one nobody has claimed, so "already linked to someone else"
 * cannot arise at match time against this data - only as a rejected write
 * once matches are persisted. It belongs with that change, not ahead of it.
 */

type Row = MemberRecord & { extraGithub?: string };

export function MembersScreen({
  title,
  members,
  unmatchedAccount,
}: {
  title: string;
  members: MemberRecord[];
  unmatchedAccount: UnmatchedAccount | null;
}) {
  const showToast = useToast();

  const [unmatched, setUnmatched] = useState(unmatchedAccount);
  const [rows, setRows] = useState<Row[]>(members);
  const [choice, setChoice] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);

  function match() {
    if (!unmatched || !choice) return;

    const member = rows.find((row) => row.id === choice);
    const account = unmatched;

    setUnmatched(null);
    setChoice("");

    if (member) {
      setRows((current) =>
        current.map((row) =>
          row.id === member.id ? { ...row, extraGithub: account.handle } : row,
        ),
      );
    }

    showToast({
      message: member
        ? `${account.handle} is now linked to ${member.name}. ${account.commits} commits will be counted for them.`
        : `${account.handle} is marked as nobody's. Its ${account.commits} commits stay out of the report.`,
      onUndo: () => {
        setUnmatched(account);
        if (member) {
          setRows((current) =>
            current.map((row) =>
              row.id === member.id ? { ...row, extraGithub: undefined } : row,
            ),
          );
        }
        showToast({ message: "Match undone." });
        // The card is back; focus returns to the control it was chosen from.
        requestAnimationFrame(() => selectRef.current?.focus());
      },
    });
  }

  return (
    <>
      <PageHeader
        meta={[title, unmatched ? "1 account unmatched" : "all accounts matched"]}
        title="Members"
        actions={<Button variant="secondary">Add member</Button>}
      />

      {unmatched ? (
        <Card attention>
          <div className="flex items-center gap-5">
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-tile bg-tint-amber text-amber-800"
            >
              <WarningIcon size={20} />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="text-section font-semibold text-ink-900">
                GitHub - {unmatched.handle}
              </h2>
              <p className="text-body text-amber-800">
                {unmatched.commits} commits in {unmatched.repository} since{" "}
                {unmatched.since}, counted for nobody.
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <div className="flex items-end gap-3">
                <div className="flex w-55 flex-col gap-1.5">
                  <label
                    htmlFor="match-1"
                    className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                  >
                    Match to a member
                  </label>
                  <select
                    ref={selectRef}
                    id="match-1"
                    value={choice}
                    onChange={(event) => setChoice(event.target.value)}
                    aria-describedby="match-reason"
                    className={`min-h-9 rounded-control border border-ink-300 bg-surface-card px-3 text-body ${
                      choice ? "text-ink-900" : "text-ink-500"
                    }`}
                  >
                    <option value="" disabled>
                      Choose a member
                    </option>
                    {rows.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                    <option value="none">Not a member of this project</option>
                  </select>
                </div>
                <Button
                  onClick={match}
                  disabledReason={choice ? undefined : "Choose a member first."}
                  aria-describedby="match-reason"
                >
                  Match
                </Button>
              </div>
              {/* Reserved height so revealing the reason never moves the row. */}
              <p id="match-reason" className="min-h-5 text-body text-ink-500">
                {choice ? "" : "Choose a member first."}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            Linked members
          </h2>
          <RosterTable title={title} rows={rows} setRows={setRows} />
        </div>
      </Card>

      <RoleContextSection rows={rows} setRows={setRows} />
    </>
  );
}

function RosterTable({
  title,
  rows,
  setRows,
}: {
  title: string;
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
}) {
  const showToast = useToast();
  const [editing, setEditing] = useState<string | null>(null);

  const cell = (last: boolean) =>
    `py-3.5 pr-4 text-body text-ink-500 ${last ? "" : "border-b border-rule"}`;

  return (
    <table className="w-full border-collapse">
      <caption className="pb-3 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
        All {rows.length} members in {title} are linked to both GitHub and
        Google.
      </caption>
      <colgroup>
        <col className="w-[30%]" />
        <col className="w-[22%]" />
        <col className="w-[34%]" />
        <col className="w-[14%]" />
      </colgroup>
      <thead>
        <tr>
          {["Member", "GitHub", "Google"].map((heading) => (
            <th
              key={heading}
              scope="col"
              className="border-b border-ink-300 pr-4 pb-2.5 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
            >
              {heading}
            </th>
          ))}
          <th scope="col" className="border-b border-ink-300 pb-2.5">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((member, index) => {
          const last = index === rows.length - 1;
          return editing === member.id ? (
            <EditRow
              key={member.id}
              member={member}
              last={last}
              onCancel={() => setEditing(null)}
              onSave={(next) => {
                setRows((current) =>
                  current.map((row) =>
                    row.id === member.id ? { ...row, ...next } : row,
                  ),
                );
                setEditing(null);
                showToast({
                  message: `${member.name} is now linked to ${next.githubUsername}.`,
                });
              }}
            />
          ) : (
            <tr key={member.id}>
              <th
                scope="row"
                className={`py-3.5 pr-4 text-left text-body font-medium text-ink-900 ${
                  last ? "" : "border-b border-rule"
                }`}
              >
                {member.name}
              </th>
              <td className={cell(last)}>
                {member.githubUsername}
                {member.extraGithub ? (
                  <span className="block text-ink-900">
                    {member.extraGithub}
                  </span>
                ) : null}
              </td>
              <td className={cell(last)}>{member.googleEmail}</td>
              <td className={`py-3.5 ${last ? "" : "border-b border-rule"}`}>
                <button
                  type="button"
                  onClick={() => setEditing(member.id)}
                  className="rounded-sm py-2 text-body font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 hover:decoration-2"
                >
                  Change
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

const editControl =
  "min-h-9 w-full rounded-control border border-ink-300 bg-surface-card px-2 text-body text-ink-900";

/**
 * The inline edit state. `Cancel` restores the original values before
 * anything is written, which is why this row has no undo of its own.
 */
function EditRow({
  member,
  last,
  onSave,
  onCancel,
}: {
  member: Row;
  last: boolean;
  onSave: (next: { githubUsername: string; googleEmail: string }) => void;
  onCancel: () => void;
}) {
  const [github, setGithub] = useState(member.githubUsername);
  const [google, setGoogle] = useState(member.googleEmail);
  const edge = last ? "" : "border-b border-rule";

  return (
    <tr className="bg-tint-indigo">
      <th
        scope="row"
        className={`py-3 pr-4 text-left text-body font-medium text-ink-900 ${edge}`}
      >
        {member.name}
      </th>
      <td className={`py-3 pr-4 ${edge}`}>
        <label htmlFor={`github-${member.id}`} className="sr-only">
          GitHub account for {member.name}
        </label>
        <input
          autoFocus
          id={`github-${member.id}`}
          value={github}
          onChange={(event) => setGithub(event.target.value)}
          className={editControl}
        />
      </td>
      <td className={`py-3 pr-4 ${edge}`}>
        <label htmlFor={`google-${member.id}`} className="sr-only">
          Google account for {member.name}
        </label>
        <input
          id={`google-${member.id}`}
          value={google}
          onChange={(event) => setGoogle(event.target.value)}
          className={editControl}
        />
      </td>
      <td className={`py-3 ${edge}`}>
        <div className="flex gap-2">
          <Button
            className="min-h-8! px-3!"
            onClick={() =>
              onSave({ githubUsername: github, googleEmail: google })
            }
          >
            Save
          </Button>
          <Button
            variant="secondary"
            className="min-h-8! px-3!"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </td>
    </tr>
  );
}

function RoleContextSection({
  rows,
  setRows,
}: {
  rows: Row[];
  setRows: React.Dispatch<React.SetStateAction<Row[]>>;
}) {
  const showToast = useToast();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-subhead font-semibold text-ink-900">
            Role and responsibilities
          </h2>
          <p className="mt-1 text-body text-ink-500">
            Add context for how each member describes their project role.
          </p>
        </div>

        <div className="divide-y divide-rule">
          {rows.map((member) =>
            editing === member.id ? (
              <RoleContextEditor
                key={member.id}
                member={member}
                onCancel={() => setEditing(null)}
                onSaved={(roleContext) => {
                  setRows((current) =>
                    current.map((row) =>
                      row.id === member.id ? { ...row, roleContext } : row,
                    ),
                  );
                  setEditing(null);
                  showToast({ message: `Role context saved for ${member.name}.` });
                }}
              />
            ) : (
              <RoleContextRow
                key={member.id}
                member={member}
                onEdit={() => setEditing(member.id)}
              />
            ),
          )}
        </div>
      </div>
    </Card>
  );
}

function RoleContextRow({
  member,
  onEdit,
}: {
  member: Row;
  onEdit: () => void;
}) {
  const roleContext = member.roleContext;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-body font-semibold text-ink-900">{member.name}</p>
        {roleContext ? (
          <div className="mt-1 flex flex-col gap-1 text-body text-ink-500">
            <p>{roleContext.primaryRole}</p>
            {roleContext.responsibilities.length > 0 ? (
              <p>{roleContext.responsibilities.join(" · ")}</p>
            ) : null}
            <p className="text-eyebrow uppercase tracking-[0.06em] text-ink-400">
              {roleContext.submissionType === "memberSelfReported"
                ? "Self-reported"
                : "Recorded by project owner"}
            </p>
          </div>
        ) : (
          <p className="mt-1 text-body text-ink-500">No role context recorded.</p>
        )}
      </div>
      <Button
        variant="quiet"
        className="shrink-0"
        onClick={onEdit}
      >
        {roleContext ? "Edit role" : "Add role"}
      </Button>
    </div>
  );
}

function RoleContextEditor({
  member,
  onSaved,
  onCancel,
}: {
  member: Row;
  onSaved: (roleContext: MemberRoleContextRecord) => void;
  onCancel: () => void;
}) {
  const initial = member.roleContext;
  const [primaryRole, setPrimaryRole] = useState(initial?.primaryRole ?? "");
  const [additionalRoles, setAdditionalRoles] = useState(
    initial?.additionalRoles.join("\n") ?? "",
  );
  const [responsibilities, setResponsibilities] = useState(
    initial?.responsibilities.join("\n") ?? "",
  );
  const [additionalContext, setAdditionalContext] = useState(
    initial?.additionalContext ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrimaryRole = primaryRole.trim();
    if (!trimmedPrimaryRole) {
      setError("Enter a primary role.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/members/${member.id}/role-context`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryRole: trimmedPrimaryRole,
          additionalRoles: splitLines(additionalRoles),
          responsibilities: splitLines(responsibilities),
          additionalContext: additionalContext.trim() || null,
        }),
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isRoleContextResponse(payload)) {
        throw new Error(
          isApiErrorResponse(payload)
            ? payload.error.message
            : "Role context could not be saved.",
        );
      }

      onSaved({
        primaryRole: payload.data.primaryRole,
        additionalRoles: payload.data.additionalRoles,
        responsibilities: payload.data.responsibilities,
        additionalContext: payload.data.additionalContext,
        submissionType: payload.data.submissionType,
        updatedAt: payload.data.updatedAt,
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Role context could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={save}
      className="grid gap-4 py-4 first:pt-0"
      aria-label={`Edit role context for ${member.name}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-body font-semibold text-ink-900">{member.name}</h3>
        <span className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
          Project owner recorded
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-body font-semibold text-ink-900">
          Primary role
          <input
            autoFocus
            value={primaryRole}
            onChange={(event) => setPrimaryRole(event.target.value)}
            className={editControl}
            maxLength={120}
            placeholder="e.g. Backend Developer"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-body font-semibold text-ink-900">
          Additional roles
          <textarea
            value={additionalRoles}
            onChange={(event) => setAdditionalRoles(event.target.value)}
            className={`${editControl} min-h-20 py-2`}
            placeholder="One role per line"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-body font-semibold text-ink-900 md:col-span-2">
          Responsibilities
          <textarea
            value={responsibilities}
            onChange={(event) => setResponsibilities(event.target.value)}
            className={`${editControl} min-h-24 py-2`}
            placeholder="One responsibility per line"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-body font-semibold text-ink-900 md:col-span-2">
          Additional context
          <textarea
            value={additionalContext}
            onChange={(event) => setAdditionalContext(event.target.value)}
            className={`${editControl} min-h-24 py-2`}
            maxLength={4000}
            placeholder="Optional context"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="text-body text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving} disabledReason={saving ? "Saving." : undefined}>
          {saving ? "Saving..." : "Save role"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRoleContextResponse(
  value: unknown,
): value is { data: MemberRoleContextRecord } {
  if (!isRecord(value) || !isRecord(value.data)) return false;

  const data = value.data;
  return (
    typeof data.primaryRole === "string" &&
    Array.isArray(data.additionalRoles) &&
    data.additionalRoles.every((role) => typeof role === "string") &&
    Array.isArray(data.responsibilities) &&
    data.responsibilities.every(
      (responsibility) => typeof responsibility === "string",
    ) &&
    (data.additionalContext === null ||
      typeof data.additionalContext === "string") &&
    (data.submissionType === "memberSelfReported" ||
      data.submissionType === "projectOwnerRecorded") &&
    typeof data.updatedAt === "string"
  );
}

function isApiErrorResponse(
  value: unknown,
): value is { error: { message: string } } {
  return (
    isRecord(value) &&
    isRecord(value.error) &&
    typeof value.error.message === "string"
  );
}
