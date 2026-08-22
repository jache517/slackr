"use client";

import { CloseIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui";

import { emptyMember, type Draft, type MemberDraft, type MemberErrors } from "./draft";
import { controlClass, describedBy, Field } from "./fields";

/**
 * Step 2. A member is a name; the identities under it are what lets observed
 * activity be attributed to a person. They are optional here because a name
 * with no identity is still a real member of the group - their evidence just
 * arrives once someone maps the account, on the project's Members screen.
 */
export function MembersStep({
  draft,
  errors,
  onChange,
  registerField,
}: {
  draft: Draft;
  errors: Map<string, MemberErrors>;
  onChange: (patch: Partial<Draft>) => void;
  registerField: (id: string) => (element: HTMLElement | null) => void;
}) {
  function update(key: string, patch: Partial<MemberDraft>) {
    onChange({
      members: draft.members.map((member) =>
        member.key === key ? { ...member, ...patch } : member,
      ),
    });
  }

  function add() {
    onChange({ members: [...draft.members, emptyMember()] });
  }

  function remove(key: string) {
    onChange({ members: draft.members.filter((member) => member.key !== key) });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-subhead font-semibold text-ink-900">Members</h2>
        <p className="text-body text-ink-500">
          Everyone whose contribution the report should cover, including you.
          Identities are how a commit or a document edit is attributed to a
          person: leave one blank and that member simply has nothing linked yet.
        </p>
      </div>

      <ol className="flex list-none flex-col gap-4 p-0">
        {draft.members.map((member, index) => {
          const rowErrors = errors.get(member.key) ?? {};
          const id = (field: string) => `member-${index}-${field}`;

          return (
            <li
              key={member.key}
              className="flex flex-col gap-4 rounded-tile border border-rule bg-surface-page p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                  Member {index + 1}
                </h3>
                {draft.members.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => remove(member.key)}
                    className="inline-flex items-center gap-2 rounded-control px-2 py-1 text-body text-ink-500 hover:bg-surface-card hover:text-ink-900"
                  >
                    <CloseIcon size={12} />
                    Remove
                    <span className="sr-only">
                      {member.name.trim() || `member ${index + 1}`}
                    </span>
                  </button>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  id={id("name")}
                  label="Name"
                  error={rowErrors.name}
                  help="As the group knows them."
                >
                  <input
                    ref={registerField(id("name"))}
                    id={id("name")}
                    type="text"
                    required
                    autoComplete="off"
                    value={member.name}
                    onChange={(event) =>
                      update(member.key, { name: event.target.value })
                    }
                    aria-invalid={rowErrors.name ? true : undefined}
                    aria-describedby={describedBy(id("name"), rowErrors.name)}
                    className={controlClass}
                  />
                </Field>

                <Field
                  id={id("email")}
                  label="Email address"
                  optional
                  error={rowErrors.email}
                  help="Used to invite them."
                >
                  <input
                    ref={registerField(id("email"))}
                    id={id("email")}
                    type="email"
                    autoComplete="off"
                    value={member.email}
                    onChange={(event) =>
                      update(member.key, { email: event.target.value })
                    }
                    aria-invalid={rowErrors.email ? true : undefined}
                    aria-describedby={describedBy(id("email"), rowErrors.email)}
                    className={controlClass}
                  />
                </Field>

                <Field
                  id={id("github")}
                  label="GitHub username"
                  optional
                  error={rowErrors.githubUsername}
                  help="Attributes their commits."
                >
                  <input
                    ref={registerField(id("github"))}
                    id={id("github")}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={member.githubUsername}
                    onChange={(event) =>
                      update(member.key, { githubUsername: event.target.value })
                    }
                    aria-invalid={rowErrors.githubUsername ? true : undefined}
                    aria-describedby={describedBy(
                      id("github"),
                      rowErrors.githubUsername,
                    )}
                    className={controlClass}
                  />
                </Field>

                <Field
                  id={id("google")}
                  label="Google account"
                  optional
                  error={rowErrors.googleEmail}
                  help="Attributes their Docs activity."
                >
                  <input
                    ref={registerField(id("google"))}
                    id={id("google")}
                    type="email"
                    autoComplete="off"
                    value={member.googleEmail}
                    onChange={(event) =>
                      update(member.key, { googleEmail: event.target.value })
                    }
                    aria-invalid={rowErrors.googleEmail ? true : undefined}
                    aria-describedby={describedBy(
                      id("google"),
                      rowErrors.googleEmail,
                    )}
                    className={controlClass}
                  />
                </Field>
              </div>
            </li>
          );
        })}
      </ol>

      <div>
        <Button variant="secondary" onClick={add}>
          <PlusIcon />
          Add another member
        </Button>
      </div>
    </div>
  );
}
