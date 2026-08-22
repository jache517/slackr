import Link from "next/link";

import { GithubMark, GoogleMark } from "@/components/icons";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { listProjects } from "@/lib/data/queries";

export const metadata = { title: "Members - Slackr" };

/**
 * Everyone across every project, and which identities they are linked to.
 *
 * A person shows once per project they are in, because their contribution
 * only means anything inside one: 7% of a group of four and 7% of a group of
 * ten are not the same fact.
 *
 * Status is about the mapping, not the person: it says whether both
 * identities are linked. An unlinked account is why a member's work goes
 * uncounted, so it is stated in red rather than left blank.
 */

function Identity({ value }: { value: string }) {
  if (!value) {
    return <span className="text-body text-red-700">Not connected</span>;
  }

  return <span className="text-body text-ink-900">{value}</span>;
}

export default async function MembersPage() {
  const projects = await listProjects();

  const rows = projects
    .flatMap((project) =>
      project.members.map((member) => ({ member, project })),
    )
    .sort((a, b) => a.member.name.localeCompare(b.member.name));

  const people = new Set(rows.map((row) => row.member.name)).size;
  const unlinked = rows.filter(
    (row) => !row.member.githubUsername || !row.member.googleEmail,
  ).length;

  const headings = [
    { key: "member", label: "Member", mark: null },
    { key: "github", label: "GitHub account", mark: <GithubMark size={16} /> },
    { key: "google", label: "Google account", mark: <GoogleMark size={16} /> },
    { key: "status", label: "Status", mark: null },
    { key: "action", label: "Action", mark: null },
  ];

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
        {rows.length === 0 ? (
          <p className="text-body text-ink-500">
            No members yet. They appear here once a project has people in it.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[26%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
            </colgroup>
            <thead>
              <tr>
                {headings.map((heading) => (
                  <th
                    key={heading.key}
                    scope="col"
                    className="border-b border-ink-300 pr-4 pb-3 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                  >
                    <span className="flex items-center gap-2">
                      {heading.mark}
                      {heading.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ member, project }, index) => {
                const linked = Boolean(
                  member.githubUsername && member.googleEmail,
                );
                const edge =
                  index < rows.length - 1 ? "border-b border-rule" : "";

                return (
                  <tr key={`${project.id}-${member.id}`}>
                    <th
                      scope="row"
                      className={`py-4 pr-4 text-left font-normal ${edge}`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          aria-hidden
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-tint-indigo text-eyebrow font-semibold text-indigo-600"
                        >
                          {member.initials}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <Link
                            href={`/projects/${project.id}/report/${member.slug}`}
                            className="text-body font-medium text-indigo-600 hover:text-indigo-700 hover:underline hover:underline-offset-2"
                          >
                            {member.name}
                          </Link>
                          <span className="truncate text-body text-ink-500">
                            {project.title}
                          </span>
                        </span>
                      </span>
                    </th>

                    <td className={`py-4 pr-4 ${edge}`}>
                      <Identity value={member.githubUsername} />
                    </td>

                    <td className={`py-4 pr-4 ${edge}`}>
                      <Identity value={member.googleEmail} />
                    </td>

                    <td className={`py-4 pr-4 ${edge}`}>
                      <Badge tone={linked ? "ok" : "warn"}>
                        {linked ? "Active" : "Incomplete"}
                      </Badge>
                    </td>

                    <td className={`py-4 ${edge}`}>
                      <ButtonLink
                        href={`/projects/${project.id}/members`}
                        variant="secondary"
                      >
                        Edit
                      </ButtonLink>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
