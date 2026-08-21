import { notFound } from "next/navigation";

import { Disclosure } from "@/components/disclosure";
import { CheckIcon, WarningIcon } from "@/components/icons";
import { ButtonLink, Card, PageHeader, StatTile } from "@/components/ui";
import { getProjectReport, getReadinessChecks } from "@/lib/data/queries";

export default async function ProjectDashboardPage({
  params,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const report = await getProjectReport(projectId);
  const checks = await getReadinessChecks(projectId);

  if (!report || !checks) notFound();

  const { project, totals } = report;
  const openChecks = checks.filter((check) => check.state === "blocked");
  const passing = checks.length - openChecks.length;

  return (
    <>
      <PageHeader
        backLink={{ href: "/projects", label: "Back to Projects" }}
        meta={[
          project.name,
          `Due ${project.dueLabel.replace("due ", "")}`,
          `${passing} of ${checks.length} checks pass`,
        ]}
        title={
          openChecks.length === 0
            ? "Ready to report."
            : "One thing to settle before you report."
        }
        actions={
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-3">
              <ButtonLink
                href={`/projects/${project.id}/report`}
                variant="secondary"
              >
                Generate the report without those {project.unmatchedAccount?.commits ?? 0} commits
              </ButtonLink>
              <ButtonLink href={`/projects/${project.id}/members`}>
                Match it on Members
              </ButtonLink>
            </div>
            <p className="text-right text-body text-ink-500">
              The {project.unmatchedAccount?.commits ?? 0} commits stay out of
              every member&apos;s total.
            </p>
          </div>
        }
      />

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            What the report needs
          </h2>
          <ul className="flex list-none flex-col p-0">
            {checks.map((check, index) => (
              <li
                key={check.key}
                className={`grid grid-cols-[24px_220px_1fr] items-center gap-x-4 py-4 ${
                  index < checks.length - 1 ? "border-b border-rule" : "pb-0"
                } ${index === 0 ? "pt-0" : ""}`}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-full ${
                    check.state === "done" ? "bg-tint-green" : "bg-tint-amber"
                  }`}
                >
                  {check.state === "done" ? (
                    <CheckIcon size={12} className="text-green-800" />
                  ) : (
                    <WarningIcon size={12} className="text-amber-800" />
                  )}
                </span>
                <span className="text-body font-medium text-ink-900">
                  {check.label}
                </span>
                <span
                  className={`text-body ${
                    check.state === "done" ? "text-ink-900" : "text-amber-800"
                  }`}
                >
                  <span className="mr-2 text-eyebrow font-semibold uppercase tracking-[0.06em]">
                    {check.state === "done" ? "Done" : "Blocked"}
                  </span>
                  {check.detail}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {project.unmatchedAccount ? (
        <div className="flex items-start gap-3 rounded-card bg-tint-amber px-5 py-4">
          <WarningIcon size={18} className="mt-px shrink-0 text-amber-800" />
          <p className="text-body text-amber-800">
            1 GitHub account, {project.unmatchedAccount.handle}, is matched to
            nobody. Its {project.unmatchedAccount.commits} commits are left out.
          </p>
        </div>
      ) : null}

      <Card>
        <Disclosure
          showLabel="Show what has been collected"
          hideLabel="Hide what has been collected"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-subhead font-semibold text-ink-900">
              What has been collected
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <StatTile value={String(totals.commits)} label="Commits" />
              <StatTile value={String(totals.docEdits)} label="Doc edits" />
              <StatTile
                value={String(totals.attendances)}
                label="Meeting attendances"
              />
              <StatTile value={project.lastCollected} label="Last collected" />
            </div>
            <p className="text-body text-ink-500">
              {totals.commits} + {totals.docEdits} + {totals.attendances} ={" "}
              {totals.events} recorded events.
            </p>
          </div>
        </Disclosure>
      </Card>
    </>
  );
}
