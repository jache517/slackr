import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CalendarIcon,
  ClockIcon,
  ConnectionsIcon,
  GithubMark,
  SparkleIcon,
  GoogleDocsMark,
  GoogleMeetMark,
  MembersIcon,
  ReportsIcon,
  WarningIcon,
} from "@/components/icons";
import {
  Badge,
  ButtonLink,
  Card,
  PageHeader,
  type BadgeTone,
} from "@/components/ui";

import { SyncButton } from "./sync-button";
import {
  getProjectReport,
  getReadinessChecks,
  type SourceRecord,
} from "@/lib/data/queries";
import type { ProjectStatus, SourceKey } from "@/lib/data/types";

/**
 * The project dashboard: what the project is, what it is collecting from, and
 * who is in it.
 *
 * The three tiles are counts, not judgements. Coverage is the share of
 * members with any recorded activity at all - it says how much of the group
 * the connected sources can see, never how much anyone did.
 */

const STATUS: Record<ProjectStatus, { tone: BadgeTone; label: string }> = {
  collecting: { tone: "ok", label: "Active" },
  needs_attention: { tone: "warn", label: "Needs attention" },
  too_early: { tone: "early", label: "Too early" },
};

const SOURCE_MARKS: Record<SourceKey, React.ComponentType<{ size?: number }>> = {
  github: GithubMark,
  google_docs: GoogleDocsMark,
  google_meet: GoogleMeetMark,
};

function StatCard({
  icon,
  tint,
  value,
  label,
  detail,
}: {
  icon: React.ReactNode;
  tint: string;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${tint}`}
        >
          {icon}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <b data-tabular className="text-stat font-semibold text-ink-900">
            {value}
          </b>
          <span className="text-body font-semibold text-ink-900">{label}</span>
          <span className="text-body text-ink-500">{detail}</span>
        </div>
      </div>
    </Card>
  );
}

/** A field an unconnected source has no value for. */
function Blank() {
  return (
    <span className="text-ink-500">
      <span aria-hidden>--</span>
      <span className="sr-only">none</span>
    </span>
  );
}

function SourceRow({
  source,
  last,
}: {
  source: SourceRecord;
  last: boolean;
}) {
  const Mark = SOURCE_MARKS[source.key];

  return (
    <li
      className={`grid grid-cols-[36px_150px_minmax(0,1fr)_140px_1fr] items-center gap-4 py-4 ${
        last ? "pb-0" : "border-b border-rule"
      }`}
    >
      <span className="flex size-9 items-center justify-center">
        <Mark size={22} />
      </span>

      <span className="text-body font-medium text-ink-900">{source.label}</span>

      <span className="min-w-0 truncate text-body">
        {source.url && source.displayName ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-indigo-600 hover:text-indigo-700 hover:underline hover:underline-offset-2"
          >
            {source.displayName}
          </a>
        ) : source.displayName ? (
          <span className="text-indigo-600">{source.displayName}</span>
        ) : (
          <Blank />
        )}
      </span>

      <span className="justify-self-start">
        {source.connected ? (
          <Badge tone="ok">Connected</Badge>
        ) : (
          <Badge tone="warn">Not connected</Badge>
        )}
      </span>

      <span className="text-right text-body text-ink-500">
        {source.lastSyncLabel ? source.lastSyncLabel : <Blank />}
      </span>
    </li>
  );
}

export default async function ProjectDashboardPage({
  params,
}: PageProps<"/projects/[projectId]">) {
  const { projectId } = await params;
  const report = await getProjectReport(projectId);
  const checks = await getReadinessChecks(projectId);

  if (!report || !checks) notFound();

  const { project, members } = report;
  const blocked = checks.filter((check) => check.state === "blocked");
  const status = STATUS[project.status];
  const connected = project.sources.filter((source) => source.connected).length;

  return (
    <>
      <PageHeader
        backLink={{ href: "/projects", label: "Back to Projects" }}
        title={project.title}
        badge={<Badge tone={status.tone}>{status.label}</Badge>}
        facts={[
          {
            icon: <MembersIcon size={16} />,
            text: `${project.memberCount} members`,
          },
          {
            icon: <CalendarIcon size={16} />,
            text: `Deadline: ${project.deadlineLabel}`,
          },
          {
            icon: <ClockIcon size={16} />,
            text: `Last updated: ${project.lastCollectedLabel}`,
          },
        ]}
        actions={
          <>
            <SyncButton projectId={project.id} />
            <ButtonLink href={`/projects/${project.id}/report`} className="group">
              <SparkleIcon size={18} />
              Generate report
            </ButtonLink>
          </>
        }
      />

      {blocked.length > 0 ? (
        <div className="flex items-start gap-3 rounded-card bg-tint-amber px-5 py-4">
          <WarningIcon size={18} className="mt-px shrink-0 text-amber-800" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {blocked.map((check) => (
              <p key={check.key} className="text-body text-amber-800">
                {check.detail}
              </p>
            ))}
          </div>
          {project.unmatchedAccount ? (
            <ButtonLink
              href={`/projects/${project.id}/members`}
              variant="secondary"
              className="shrink-0"
            >
              Match it on Members
            </ButtonLink>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={<MembersIcon size={20} className="text-indigo-600" />}
          tint="bg-tint-indigo"
          value={String(project.memberCount)}
          label="Members"
          detail={`${project.membersWithActivity} with recorded activity`}
        />
        <StatCard
          icon={<ConnectionsIcon size={20} className="text-indigo-600" />}
          tint="bg-tint-indigo"
          value={`${connected} / ${project.sources.length}`}
          label="Sources connected"
          detail={
            connected === project.sources.length
              ? "Every source is collecting"
              : `${project.sources.length - connected} not connected`
          }
        />
        <StatCard
          icon={<ReportsIcon size={20} className="text-green-800" />}
          tint="bg-tint-green"
          value={`${project.coveragePercent}%`}
          label="Data coverage"
          detail={`${project.membersWithActivity} of ${project.memberCount} members have activity`}
        />
      </div>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            Connected sources
          </h2>

          <ul className="flex list-none flex-col p-0">
            {project.sources.map((source, index) => (
              <SourceRow
                key={source.key}
                source={source}
                last={index === project.sources.length - 1}
              />
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-subhead font-semibold text-ink-900">Members</h2>
            <ButtonLink
              href={`/projects/${project.id}/members`}
              variant="secondary"
            >
              <MembersIcon size={18} />
              Match identities
            </ButtonLink>
          </div>

          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="border-b border-rule text-left">
                {[
                  "Name",
                  "GitHub username",
                  "Google account",
                  "Last active",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="py-3 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-rule last:border-0">
                  <td className="py-3">
                    <span className="flex items-center gap-3">
                      <span
                        aria-hidden
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tint-indigo text-eyebrow font-semibold text-indigo-600"
                      >
                        {member.initials}
                      </span>
                      <Link
                        href={`/projects/${project.id}/report/${member.slug}`}
                        className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline hover:underline-offset-2"
                      >
                        {member.name}
                      </Link>
                    </span>
                  </td>
                  <td className="py-3 text-ink-900">
                    {member.githubUsername || (
                      <span className="text-ink-500 italic">Not linked</span>
                    )}
                  </td>
                  <td className="py-3 text-ink-900">
                    {member.googleEmail || (
                      <span className="text-ink-500 italic">Not linked</span>
                    )}
                  </td>
                  <td className="py-3 text-ink-500">{member.lastActive}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/projects/${project.id}/members?memberId=${encodeURIComponent(member.id)}`}
                      className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline hover:underline-offset-2"
                    >
                      Edit role
                    </Link>
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
