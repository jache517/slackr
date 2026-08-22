import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/report/activity-timeline";
import { Card, PageHeader } from "@/components/ui";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireSession } from "@/lib/auth/require-session";
import { generateAiEvidenceReport } from "@/lib/report/ai-report-service";
import { getReportScope } from "@/lib/report/report-repository";
import { buildCanonicalEvidenceSnapshot } from "@/lib/report/report-service";
import { resolveReportPeriod } from "@/lib/report/report-validation";
import type { CanonicalEvidenceSnapshot, ReportVisualisation } from "@/types/api";

const SOURCE_LABEL = { github: "GitHub", googleDocs: "Google Docs" } as const;

function formatDate(timestamp: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function formatMoment(timestamp: string) {
  return `${new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp))} UTC`;
}

/**
 * A count, or the reason there is no count. A zero from a connected source
 * means the member did nothing; the words mean the source could not say.
 */
function evidenceCell(
  count: number | null,
  status: "unconnected" | "connected" | "failed",
) {
  if (count !== null) return { text: String(count), value: count, real: true };

  return {
    text: status === "unconnected" ? "Not connected" : "Unavailable",
    value: 0,
    real: false,
  };
}

/** The most recent moment either source saw this member, or null. */
function lastActive(member: CanonicalEvidenceSnapshot["members"][number]) {
  const stamps = [
    member.evidence.github?.lastActiveAt,
    member.evidence.googleDocs?.lastActiveAt,
  ].filter((value): value is string => Boolean(value));

  if (stamps.length === 0) return null;

  return stamps.reduce((latest, value) => (value > latest ? value : latest));
}

/** Proportional bar sharing the row with its figure, so the two cannot disagree. */
function Meter({ value, max, tone }: { value: number; max: number; tone: string }) {
  return (
    <span
      aria-hidden
      className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-surface-track"
    >
      <span
        className={`block h-full rounded-full ${tone}`}
        style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%` }}
      />
    </span>
  );
}

export default async function ReportPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/report">) {
  const { projectId } = await params;
  const query = await searchParams;
  const { supabase, user } = await requireSession();
  const access = await requireProjectAccess(supabase, user, projectId);

  if (!access.ok) notFound();

  const scope = await getReportScope(supabase, projectId);

  if (!scope.ok) notFound();

  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const entry of value) queryParams.append(key, entry);
    } else if (value !== undefined) {
      queryParams.set(key, value);
    }
  }

  const period = resolveReportPeriod(
    queryParams,
    scope.project.created_at,
    scope.project.deadline,
  );

  if (!period.ok) notFound();

  const snapshot = buildCanonicalEvidenceSnapshot(scope, period.period);
  const aiResult = await generateAiEvidenceReport(snapshot);
  const report = aiResult.ok ? aiResult.report : null;

  const rows = snapshot.members.map((member) => ({
    member,
    github: evidenceCell(
      member.evidence.github?.commitCount ?? null,
      snapshot.sourceStates.github.status,
    ),
    docs: evidenceCell(
      member.evidence.googleDocs?.activityCount ?? null,
      snapshot.sourceStates.googleDocs.status,
    ),
    lastActiveAt: lastActive(member),
  }));

  const maxGithub = Math.max(1, ...rows.map((row) => row.github.value));
  const maxDocs = Math.max(1, ...rows.map((row) => row.docs.value));

  // Only members who actually said something. Printing "none recorded" for
  // everyone else was most of this page's length and none of its meaning.
  const withNotes = snapshot.members.filter(
    (member) => member.roleContext !== null || member.context.length > 0,
  );

  const timeline = snapshot.visualisations.find(
    (visualisation): visualisation is Extract<ReportVisualisation, { type: "timeline" }> =>
      visualisation.type === "timeline",
  );

  const unhealthy = (["github", "googleDocs"] as const).filter(
    (key) => snapshot.sourceStates[key].status !== "connected",
  );

  return (
    <>
      <PageHeader
        backLink={{
          href: `/projects/${projectId}`,
          label: "Back to Dashboard",
        }}
        meta={[
          snapshot.project.title,
          `${snapshot.monitoringPeriod.from} to ${snapshot.monitoringPeriod.to}`,
          `${snapshot.members.length} members`,
          `Generated ${formatMoment(report?.generatedAt ?? snapshot.generatedAt)}`,
        ]}
        title={report?.title ?? "Evidence report"}
      />

      {unhealthy.length > 0 ? (
        <Card attention>
          <p className="text-body text-amber-800">
            {unhealthy
              .map(
                (key) =>
                  `${SOURCE_LABEL[key]} is ${
                    snapshot.sourceStates[key].status === "unconnected"
                      ? "not connected"
                      : "unavailable"
                  }`,
              )
              .join(", and ")}
            . Figures below cover only what the remaining sources recorded.
          </p>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3">
          <span className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
            {report ? "AI draft - review before use" : "Evidence only"}
          </span>
          <p className="text-body leading-7 text-ink-700">
            {report?.overview ??
              "AI report generation is not configured, so this page shows the recorded evidence without a written summary."}
          </p>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            Recorded evidence
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <caption className="sr-only">
                Recorded evidence by member and source
              </caption>
              <thead>
                <tr className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                  <th scope="col" className="border-b border-ink-300 pb-2 text-left">
                    Member
                  </th>
                  <th scope="col" className="w-40 border-b border-ink-300 pb-2 text-right">
                    GitHub commits
                  </th>
                  <th scope="col" className="w-40 border-b border-ink-300 pb-2 text-right">
                    Docs activity
                  </th>
                  <th scope="col" className="w-36 border-b border-ink-300 pb-2 text-right">
                    Last active
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ member, github, docs, lastActiveAt }) => (
                  <tr key={member.memberId}>
                    <th
                      scope="row"
                      className="border-b border-rule py-3 pr-4 text-left align-top"
                    >
                      <span className="block text-body font-medium text-ink-900">
                        {member.name}
                      </span>
                      {member.roleContext ? (
                        <span className="block text-body text-ink-500">
                          {member.roleContext.primaryRole}
                        </span>
                      ) : null}
                    </th>

                    <td className="border-b border-rule py-3 pl-4 align-top text-right">
                      <span
                        data-tabular
                        className={`text-body ${github.real ? "text-ink-900" : "text-ink-500"}`}
                      >
                        {github.text}
                      </span>
                      {github.real ? (
                        <Meter value={github.value} max={maxGithub} tone="bg-indigo-600" />
                      ) : null}
                    </td>

                    <td className="border-b border-rule py-3 pl-4 align-top text-right">
                      <span
                        data-tabular
                        className={`text-body ${docs.real ? "text-ink-900" : "text-ink-500"}`}
                      >
                        {docs.text}
                      </span>
                      {docs.real ? (
                        <Meter value={docs.value} max={maxDocs} tone="bg-green-800" />
                      ) : null}
                    </td>

                    <td
                      data-tabular
                      className="border-b border-rule py-3 pl-4 align-top text-right text-body text-ink-500"
                    >
                      {lastActiveAt ? formatDate(lastActiveAt) : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-body text-ink-500">
            A zero means a connected source recorded nothing. Words in place of
            a number mean the source could not be read at all.
          </p>
        </div>
      </Card>

      {report && report.sections.length > 0 ? (
        <Card>
          <div className="flex flex-col gap-5">
            {report.sections.map((section) => (
              <section key={section.id} aria-labelledby={`${section.id}-heading`}>
                <h2
                  id={`${section.id}-heading`}
                  className="text-section font-semibold text-ink-900"
                >
                  {section.heading}
                </h2>
                <p className="mt-1 text-body leading-7 text-ink-700">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </Card>
      ) : null}

      {withNotes.length > 0 ? (
        <Card>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-subhead font-semibold text-ink-900">
                What the team said
              </h2>
              <p className="mt-1 text-body text-ink-500">
                Written by people, not recorded by a source. Treat it as
                context for the figures rather than proof of them.
              </p>
            </div>

            <div className="flex flex-col divide-y divide-rule">
              {withNotes.map((member) => (
                <article key={member.memberId} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-body font-semibold text-ink-900">
                    {member.name}
                  </h3>

                  {member.roleContext ? (
                    <p className="mt-1 text-body text-ink-500">
                      {[
                        member.roleContext.primaryRole,
                        ...member.roleContext.additionalRoles,
                        ...member.roleContext.responsibilities,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    </p>
                  ) : null}

                  {member.roleContext?.additionalContext ? (
                    <p className="mt-2 text-body whitespace-pre-wrap text-ink-700">
                      {member.roleContext.additionalContext}
                    </p>
                  ) : null}

                  {member.context.map((context) => (
                    <blockquote
                      key={context.id}
                      className="mt-3 border-l-2 border-indigo-600 pl-3"
                    >
                      <p className="text-body whitespace-pre-wrap text-ink-700">
                        {context.contextText}
                      </p>
                      <footer className="mt-1 text-eyebrow text-ink-500">
                        {context.submissionType === "memberSelfReported"
                          ? "Self-reported"
                          : "Recorded by owner"}{" "}
                        - {formatDate(context.createdAt)}
                      </footer>
                    </blockquote>
                  ))}
                </article>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      {timeline ? (
        <Card>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-subhead font-semibold text-ink-900">
                Recent activity
              </h2>
              <p className="mt-1 text-body text-ink-500">{timeline.caption}</p>
            </div>
            <ActivityTimeline visualisation={timeline} />
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-3">
          <h2 className="text-subhead font-semibold text-ink-900">
            Before you rely on this
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-body leading-7 text-ink-700">
            {(report?.limitations ?? snapshot.limitations).map((limitation, index) => (
              <li key={`${index}-${limitation}`}>{limitation}</li>
            ))}
          </ul>
          <p className="text-body text-ink-500">
            {report?.disclaimer ?? snapshot.disclaimer}
          </p>
        </div>
      </Card>
    </>
  );
}
