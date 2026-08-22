import Link from "next/link";

import { PlusIcon, WarningIcon } from "@/components/icons";
import {
  ButtonLink,
  Card,
  PageHeader,
  TrendCell,
} from "@/components/ui";
import {
  listProjects,
  projectInitials,
  type ProjectRecord,
} from "@/lib/data/queries";
import type { ProjectStatus } from "@/lib/data/types";

export const metadata = { title: "Projects - Slackr" };

const BUCKETS: { status: ProjectStatus; label: string; warn: boolean }[] = [
  { status: "needs_attention", label: "Needs attention", warn: true },
  { status: "collecting", label: "Collecting normally", warn: false },
  { status: "too_early", label: "Too early to compare", warn: false },
];

const statusTone: Record<ProjectStatus, string> = {
  needs_attention: "text-amber-800",
  collecting: "text-green-800",
  too_early: "text-ink-500",
};

function ProjectCard({ project }: { project: ProjectRecord }) {
  const attention = project.status === "needs_attention";

  return (
    <Card attention={attention} className="p-6">
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={`flex size-11 shrink-0 items-center justify-center rounded-tile text-eyebrow font-semibold uppercase tracking-[0.06em] ${
            attention
              ? "bg-tint-amber text-amber-800"
              : "bg-tint-indigo text-indigo-600"
          }`}
        >
          {attention ? <WarningIcon size={20} /> : projectInitials(project.title)}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-section font-semibold">
            <Link
              href={`/projects/${project.id}`}
              className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 hover:decoration-2"
            >
              {project.title}
            </Link>
          </h3>
          <p className={`text-body ${statusTone[project.status]}`}>
            {project.statusLine}
          </p>
          <p className="text-body text-ink-500">
            {project.memberCount} members - {project.dueLabel}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <TrendCell
            points={project.weeklyEvents}
            trend={project.trend}
            title={`${project.title} activity across the last four weeks: ${
              project.trend === "no_data" ? "not enough data" : project.trend
            }.`}
          />
        </div>

        {attention ? (
          <ButtonLink
            href={`/projects/${project.id}/members`}
            className="shrink-0"
          >
            Match it on Members
          </ButtonLink>
        ) : null}
      </div>
    </Card>
  );
}

export default async function ProjectsPage() {
  const projects = await listProjects();
  const needingAttention = projects.filter(
    (project) => project.status === "needs_attention",
  ).length;

  return (
    <>
      <PageHeader
        meta={[
          `${projects.length} project${projects.length === 1 ? "" : "s"}`,
          `${needingAttention} needing attention`,
        ]}
        title="Projects"
        actions={
          <ButtonLink href="/projects/new">
            <PlusIcon />
            New Project
          </ButtonLink>
        }
      />

      {BUCKETS.map(({ status, label, warn }) => {
        const inBucket = projects.filter((project) => project.status === status);
        if (inBucket.length === 0) return null;

        return (
          <section key={status} className="flex flex-col gap-3">
            <h2
              className={`text-eyebrow font-semibold uppercase tracking-[0.06em] ${
                warn ? "text-amber-800" : "text-ink-500"
              }`}
            >
              {label}
            </h2>
            {inBucket.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </section>
        );
      })}
    </>
  );
}
