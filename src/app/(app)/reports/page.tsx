import Link from "next/link";

import { Badge, Card, PageHeader, TrendCell } from "@/components/ui";
import { listProjects, projectInitials } from "@/lib/data/queries";

export const metadata = { title: "Reports - Slackr" };

/**
 * Every project's report in one list, ordered by whether it can be trusted
 * yet. A report with an unmatched account would understate somebody, so it
 * sorts above the ready ones rather than being flagged where it sits.
 */
export default async function ReportsPage() {
  const projects = await listProjects();

  const rank = { needs_attention: 0, collecting: 1, too_early: 2 } as const;
  const ordered = [...projects].sort(
    (a, b) => rank[a.status] - rank[b.status],
  );

  const blocked = ordered.filter(
    (project) => project.status === "needs_attention",
  ).length;
  const ready = ordered.filter(
    (project) => project.status === "collecting",
  ).length;

  return (
    <>
      <PageHeader
        meta={[
          `${projects.length} project${projects.length === 1 ? "" : "s"}`,
          `${ready} ready to report`,
          `${blocked} needing attention`,
        ]}
        title={
          blocked === 0
            ? "Every report is ready."
            : `${blocked} report${blocked === 1 ? "" : "s"} would understate someone.`
        }
      />

      {ordered.length === 0 ? (
        <Card>
          <p className="text-body text-ink-500">
            No projects yet. Reports appear here once a project is collecting.
          </p>
        </Card>
      ) : null}

      {ordered.map((project) => {
        const attention = project.status === "needs_attention";
        const events = project.weeklyEvents.reduce((sum, n) => sum + n, 0);

        return (
          <Card key={project.id} attention={attention} className="p-6">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className={`flex size-11 shrink-0 items-center justify-center rounded-tile text-eyebrow font-semibold uppercase tracking-[0.06em] ${
                  attention
                    ? "bg-tint-amber text-amber-800"
                    : "bg-tint-indigo text-indigo-600"
                }`}
              >
                {projectInitials(project.title)}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h2 className="text-section font-semibold">
                  <Link
                    href={`/projects/${project.id}/report`}
                    className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 hover:decoration-2"
                  >
                    {project.title}
                  </Link>
                </h2>
                <p
                  className={`text-body ${
                    attention ? "text-amber-800" : "text-ink-500"
                  }`}
                >
                  {project.statusLine}
                </p>
                <p className="text-body text-ink-500">
                  {project.memberCount} members - {events} events -{" "}
                  {project.dueLabel}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <TrendCell
                  points={project.weeklyEvents}
                  trend={project.trend}
                  title={`${project.title} activity across the last four weeks.`}
                />
                <Badge
                  tone={
                    attention ? "warn" : project.status === "collecting" ? "ok" : "early"
                  }
                >
                  {attention
                    ? "Needs attention"
                    : project.status === "collecting"
                      ? "Ready"
                      : "Too early"}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
}
