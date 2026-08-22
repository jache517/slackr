import Link from "next/link";

import { Card, PageHeader } from "@/components/ui";
import { listProjects, memberEvents } from "@/lib/data/queries";

export const metadata = { title: "Members - Slackr" };

/**
 * Everyone across every project. A person shows once per project they are in,
 * because their contribution only means anything inside one: 7% of a group of
 * four and 7% of a group of ten are not the same fact.
 */
export default async function MembersPage() {
  const projects = await listProjects();

  const rows = projects
    .flatMap((project) =>
      project.members.map((member) => ({
        member,
        project,
        events: memberEvents(member),
      })),
    )
    .sort((a, b) => a.member.name.localeCompare(b.member.name));

  const people = new Set(rows.map((row) => row.member.name)).size;
  const unlinked = rows.filter(
    (row) => !row.member.githubUsername || !row.member.googleEmail,
  ).length;

  return (
    <>
      <PageHeader
        meta={[
          `${people} ${people === 1 ? "person" : "people"}`,
          `${rows.length} project memberships`,
          unlinked === 0 ? "all accounts linked" : `${unlinked} missing an account`,
        ]}
        title="Members"
      />

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            All members
          </h2>

          {rows.length === 0 ? (
            <p className="text-body text-ink-500">
              No members yet. They appear here once a project has people in it.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <caption className="pb-3 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                Sorted by name. A person appears once for each project they are
                in.
              </caption>
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[26%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr>
                  {["Member", "Project", "GitHub", "Google", "Events"].map(
                    (heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className={`border-b border-ink-300 pr-4 pb-2.5 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500 ${
                          heading === "Events" ? "text-right" : "text-left"
                        }`}
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map(({ member, project, events }, index) => {
                  const edge =
                    index < rows.length - 1 ? "border-b border-rule" : "";
                  return (
                    <tr key={`${project.id}-${member.id}`}>
                      <th
                        scope="row"
                        className={`py-3.5 pr-4 text-left text-body font-medium ${edge}`}
                      >
                        <Link
                          href={`/projects/${project.id}/report/${member.slug}`}
                          className="text-indigo-600 hover:text-indigo-700 hover:underline hover:underline-offset-2"
                        >
                          {member.name}
                        </Link>
                      </th>
                      <td className={`py-3.5 pr-4 text-body text-ink-500 ${edge}`}>
                        {project.title}
                      </td>
                      <td className={`py-3.5 pr-4 text-body ${edge}`}>
                        {member.githubUsername ? (
                          <span className="text-ink-500">
                            {member.githubUsername}
                          </span>
                        ) : (
                          <span className="text-amber-800">Not linked</span>
                        )}
                      </td>
                      <td className={`py-3.5 pr-4 text-body ${edge}`}>
                        {member.googleEmail ? (
                          <span className="text-ink-500">
                            {member.googleEmail}
                          </span>
                        ) : (
                          <span className="text-amber-800">Not linked</span>
                        )}
                      </td>
                      <td
                        data-tabular
                        className={`py-3.5 text-right text-body text-ink-900 ${edge}`}
                      >
                        {events}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </>
  );
}
