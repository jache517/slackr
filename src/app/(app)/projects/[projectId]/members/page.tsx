import { notFound } from "next/navigation";

import { WarningIcon } from "@/components/icons";
import { Button, Card, PageHeader } from "@/components/ui";
import { getProject } from "@/lib/data/queries";

export default async function MembersPage({
  params,
}: PageProps<"/projects/[projectId]/members">) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  const unmatched = project.unmatchedAccount;

  return (
    <>
      <PageHeader
        title={
          unmatched
            ? "One GitHub account isn't matched to anyone."
            : "Every account is matched."
        }
        qualifier={
          unmatched
            ? "Work under an unmatched account is left out of the report."
            : `Nothing collected in ${project.code} is being left out.`
        }
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
                    id="match-1"
                    defaultValue=""
                    aria-describedby="match-reason"
                    className="min-h-9 rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-500"
                  >
                    <option value="" disabled>
                      Choose a member
                    </option>
                    {project.members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                    <option value="none">Not a member of this project</option>
                  </select>
                </div>
                <Button
                  disabledReason="Choose a member first."
                  aria-describedby="match-reason"
                >
                  Match
                </Button>
              </div>
              <p id="match-reason" className="text-body text-ink-500">
                Choose a member first.
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
          <table className="w-full border-collapse">
            <caption className="pb-3 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
              All {project.members.length} members in {project.code} are linked
              to both GitHub and Google.
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
              {project.members.map((member, index) => (
                <tr key={member.id}>
                  <th
                    scope="row"
                    className={`py-3.5 pr-4 text-left text-body font-medium text-ink-900 ${
                      index < project.members.length - 1
                        ? "border-b border-rule"
                        : ""
                    }`}
                  >
                    {member.name}
                  </th>
                  <td
                    className={`py-3.5 pr-4 text-body text-ink-500 ${
                      index < project.members.length - 1
                        ? "border-b border-rule"
                        : ""
                    }`}
                  >
                    {member.githubUsername}
                  </td>
                  <td
                    className={`py-3.5 pr-4 text-body text-ink-500 ${
                      index < project.members.length - 1
                        ? "border-b border-rule"
                        : ""
                    }`}
                  >
                    {member.googleEmail}
                  </td>
                  <td
                    className={`py-3.5 ${
                      index < project.members.length - 1
                        ? "border-b border-rule"
                        : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="rounded-sm py-2 text-body font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 hover:decoration-2"
                    >
                      Change
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
