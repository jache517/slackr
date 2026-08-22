import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ConnectionsIcon,
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

/** Short codes stand in for provider logos, which are not ours to draw. */
const SOURCE_CODES: Record<SourceKey, string> = {
  github: "GH",
  google_docs: "GD",
  google_meet: "GM",
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

function SourceRow({
  source,
  last,
}: {
  source: SourceRecord;
  last: boolean;
}) {
  return (
    <li
      className={`grid grid-cols-[40px_180px_1fr_auto_150px] items-center gap-4 py-4 ${
        last ? "pb-0" : "border-b border-rule"
      }`}
    >
      <span
        aria-hidden
        className="flex size-10 items-center justify-center rounded-tile bg-surface-track text-eyebrow font-semibold tracking-[0.06em] text-ink-700"
      >
        {SOURCE_CODES[source.key]}
      </span>

      <span className="text-body font-medium text-ink-900">{source.label}</span>

      <span className="min-w-0 truncate text-body text-ink-500">
        {source.displayName ?? "Not connected"}
      </span>

      {source.connected ? (
        <Badge tone="ok">Connected</Badge>
      ) : (
        <ButtonLink
          href="/connections"
          variant="secondary"
          className="justify-self-start"
        >
          Connect
        </ButtonLink>
      )}

      <span className="text-right text-body text-ink-500">
        {source.lastSyncLabel ? `Last sync: ${source.lastSyncLabel}` : ""}
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
  const lastSynced = project.sources
    .map((source) => source.lastSyncLabel)
    .find(Boolean);

  return (
    <>
      <PageHeader
        backLink={{ href: "/projects", label: "Back to Projects" }}
        title={project.title}
        badge={<Badge tone={status.tone}>{status.label}</Badge>}
        meta={[
          `${project.memberCount} members`,
          `Deadline: ${project.deadlineLabel}`,
          `Last updated: ${project.lastCollected}`,
        ]}
        actions={
          <ButtonLink href={`/projects/${project.id}/report`}>
            Generate report
          </ButtonLink>
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
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-subhead font-semibold text-ink-900">
              Connected sources
            </h2>
            <span className="text-body text-ink-500">
              {lastSynced ? `Last synced: ${lastSynced}` : "Nothing synced yet"}
            </span>
          </div>

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
          <h2 className="text-subhead font-semibold text-ink-900">Members</h2>

          <table className="w-full border-collapse text-body">
            <thead>
              <tr className="border-b border-rule text-left">
                {["Name", "GitHub username", "Google account", "Last active"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="py-3 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                    >
                      {heading}
                    </th>
                  ),
                )}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
