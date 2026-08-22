import Link from "next/link";

import {
  CalendarIcon,
  ChevronRightIcon,
  FolderIcon,
  MembersIcon,
  PlusIcon,
  SourcesIcon,
} from "@/components/icons";
import { Badge, ButtonLink, FactLine, PageHeader, type BadgeTone } from "@/components/ui";
import { ALL_SOURCE_KEYS, listProjects, type ProjectRecord } from "@/lib/data/queries";
import type { ProjectStatus } from "@/lib/data/types";

export const metadata = { title: "Projects - Slackr" };

const STATUS: Record<
  ProjectStatus,
  { tone: BadgeTone; label: string; ring: string; tile: string }
> = {
  collecting: {
    tone: "ok",
    label: "Active",
    ring: "var(--color-green-800)",
    tile: "bg-tint-green text-green-800",
  },
  needs_attention: {
    tone: "warn",
    label: "Needs attention",
    ring: "var(--color-amber-800)",
    tile: "bg-tint-amber text-amber-800",
  },
  too_early: {
    tone: "early",
    label: "Too early",
    ring: "var(--color-ink-700)",
    tile: "bg-surface-track text-ink-700",
  },
};

/** Projects needing something come first; the rest keep their deadline order. */
const ORDER: Record<ProjectStatus, number> = {
  needs_attention: 0,
  collecting: 1,
  too_early: 2,
};

/**
 * Coverage as a ring: the share of members the connected sources can see. It
 * is drawn from the same number the label states, so the arc cannot disagree
 * with the figure inside it.
 */
function CoverageRing({ percent, colour }: { percent: number; colour: string }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="var(--color-surface-track)"
        strokeWidth="6"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke={colour}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * circumference} ${circumference}`}
        transform="rotate(-90 36 36)"
      />
      <text
        x="36"
        y="36"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-ink-900 text-body font-semibold"
      >
        {percent}%
      </text>
    </svg>
  );
}

function ProjectCard({ project }: { project: ProjectRecord }) {
  const status = STATUS[project.status];
  const connected = project.sources.filter((source) => source.connected).length;

  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="grid grid-cols-[64px_1fr_auto_24px] items-center gap-6 rounded-card border border-rule bg-surface-card p-6 no-underline transition-colors duration-[120ms] hover:border-ink-700"
      >
        <span
          aria-hidden
          className={`flex size-16 items-center justify-center rounded-tile ${status.tile}`}
        >
          <FolderIcon size={26} />
        </span>

        <span className="flex min-w-0 flex-col gap-2">
          <span className="flex flex-wrap items-center gap-3">
            <span className="text-section font-semibold text-ink-900">
              {project.title}
            </span>
            <Badge tone={status.tone}>{status.label}</Badge>
          </span>

          <FactLine
            items={[
              {
                icon: <MembersIcon size={16} />,
                text: `${project.memberCount} members`,
              },
              {
                icon: <SourcesIcon size={16} />,
                text: `${connected} / ${ALL_SOURCE_KEYS.length} sources connected`,
              },
              {
                icon: <CalendarIcon size={16} />,
                text: `Deadline: ${project.deadlineLabel}`,
              },
            ]}
          />

          <span className="text-body text-ink-500">
            Last updated: {project.lastCollectedLabel}
          </span>
        </span>

        <span className="flex flex-col items-center gap-1">
          <CoverageRing
            percent={project.coveragePercent}
            colour={status.ring}
          />
          <span className="text-body text-ink-500">Data coverage</span>
        </span>

        <ChevronRightIcon size={20} className="text-ink-500" />
      </Link>
    </li>
  );
}

export default async function ProjectsPage() {
  const projects = await listProjects();
  const ordered = [...projects].sort(
    (a, b) => ORDER[a.status] - ORDER[b.status],
  );

  return (
    <>
      <PageHeader
        title="My projects"
        actions={
          <ButtonLink href="/projects/new">
            <PlusIcon />
            New Project
          </ButtonLink>
        }
      />

      {ordered.length === 0 ? (
        <p className="text-body text-ink-500">
          No projects yet. Create one and connect a source to start collecting.
        </p>
      ) : (
        <ul className="flex list-none flex-col gap-4 p-0">
          {ordered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </ul>
      )}
    </>
  );
}
