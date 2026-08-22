import { notFound } from "next/navigation";

import { ReportVisualisations } from "@/components/report/report-visualisations";
import { Card, PageHeader } from "@/components/ui";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireSession } from "@/lib/auth/require-session";
import { generateAiEvidenceReport } from "@/lib/report/ai-report-service";
import { getReportScope } from "@/lib/report/report-repository";
import { buildCanonicalEvidenceSnapshot } from "@/lib/report/report-service";
import { resolveReportPeriod } from "@/lib/report/report-validation";

function formatTimestamp(timestamp: string) {
  return `${new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp))} UTC`;
}

function sourceEvidenceCount(
  count: number | null,
  status: "unconnected" | "connected" | "failed",
) {
  if (count !== null) {
    return String(count);
  }

  return status === "unconnected"
    ? "Not connected"
    : status === "failed"
      ? "Unavailable"
      : "No evidence";
}

function authoredByLabel(
  submissionType: "memberSelfReported" | "projectOwnerRecorded",
) {
  return submissionType === "memberSelfReported"
    ? "Self-reported by member"
    : "Recorded by project owner";
}

export default async function ReportPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/report">) {
  const { projectId } = await params;
  const query = await searchParams;
  const { supabase, user } = await requireSession();
  const access = await requireProjectAccess(supabase, user, projectId);

  if (!access.ok) {
    notFound();
  }

  const scope = await getReportScope(supabase, projectId);

  if (!scope.ok) {
    notFound();
  }

  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        queryParams.append(key, entry);
      }
    } else if (value !== undefined) {
      queryParams.set(key, value);
    }
  }

  const period = resolveReportPeriod(
    queryParams,
    scope.project.created_at,
    scope.project.deadline,
  );

  if (!period.ok) {
    notFound();
  }

  const snapshot = buildCanonicalEvidenceSnapshot(scope, period.period);
  const aiResult = await generateAiEvidenceReport(snapshot);
  const report = aiResult.ok ? aiResult.report : null;

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
          `Generated ${formatTimestamp(report?.generatedAt ?? snapshot.generatedAt)}`,
        ]}
        title={report?.title ?? "Evidence report"}
      />

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
            {report ? (
              <>
                <span>AI-generated draft</span>
                <span>Instructor review required</span>
              </>
            ) : (
              <span>Evidence-only fallback</span>
            )}
          </div>

          {report ? (
            <>
              <h2 className="text-subhead font-semibold text-ink-900">
                {report.title}
              </h2>
              <p className="text-body leading-7 text-ink-700">
                {report.overview}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-subhead font-semibold text-ink-900">
                Evidence-only fallback
              </h2>
              <p className="text-body leading-7 text-ink-700">
                AI report generation is not configured yet. The evidence
                snapshot and visualisations below remain available for review.
              </p>
            </>
          )}
        </div>
      </Card>

      {report ? (
        <Card>
          <div className="flex flex-col gap-5">
            {report.sections.map((section) => (
              <section
                key={section.id}
                aria-labelledby={`${section.id}-heading`}
              >
                <h2
                  id={`${section.id}-heading`}
                  className="text-subhead font-semibold text-ink-900"
                >
                  {section.heading}
                </h2>
                <p className="mt-1 text-body leading-7 text-ink-700">
                  {section.body}
                </p>
                {section.evidenceRefs.length > 0 ? (
                  <p className="mt-2 text-eyebrow text-ink-500">
                    Evidence references: {section.evidenceRefs.join(", ")}
                  </p>
                ) : null}
              </section>
            ))}
          </div>
        </Card>
      ) : null}

      <ReportVisualisations
        visualisations={report?.visualisations ?? snapshot.visualisations}
      />

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-subhead font-semibold text-ink-900">
              Member evidence
            </h2>
            <p className="mt-1 text-body text-ink-500">
              Recorded GitHub and Google Docs evidence stays separated by
              source. A zero is connected-source evidence; textual states
              identify a source that is unconnected or unavailable.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <caption className="sr-only">
                Recorded evidence by member and source
              </caption>
              <thead>
                <tr>
                  {[
                    "Member",
                    "GitHub commits",
                    "GitHub last active",
                    "Google Docs activity",
                    "Google Docs last active",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="border-b border-ink-300 pb-2 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {snapshot.members.map((member) => (
                  <tr key={member.memberId}>
                    <th
                      scope="row"
                      className="border-b border-rule py-3 pr-4 text-left text-body font-medium text-ink-900"
                    >
                      {member.name}
                    </th>
                    <td className="border-b border-rule py-3 pr-4 text-body text-ink-700">
                      {sourceEvidenceCount(
                        member.evidence.github?.commitCount ?? null,
                        snapshot.sourceStates.github.status,
                      )}
                    </td>
                    <td className="border-b border-rule py-3 pr-4 text-body text-ink-500">
                      {member.evidence.github?.lastActiveAt
                        ? formatTimestamp(member.evidence.github.lastActiveAt)
                        : "--"}
                    </td>
                    <td className="border-b border-rule py-3 pr-4 text-body text-ink-700">
                      {sourceEvidenceCount(
                        member.evidence.googleDocs?.activityCount ?? null,
                        snapshot.sourceStates.googleDocs.status,
                      )}
                    </td>
                    <td className="border-b border-rule py-3 text-body text-ink-500">
                      {member.evidence.googleDocs?.lastActiveAt
                        ? formatTimestamp(member.evidence.googleDocs.lastActiveAt)
                        : "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-subhead font-semibold text-ink-900">
              Authored context
            </h2>
            <p className="mt-1 text-body text-ink-500">
              Role, responsibilities, and explanations are authored context,
              not provider-verified evidence.
            </p>
          </div>

          <div className="divide-y divide-rule">
            {snapshot.members.map((member) => (
              <article key={member.memberId} className="py-4 first:pt-0 last:pb-0">
                <h3 className="text-section font-semibold text-ink-900">
                  {member.name}
                </h3>

                {member.roleContext ? (
                  <dl className="mt-3 grid gap-3 text-body text-ink-700 sm:grid-cols-2">
                    <div>
                      <dt className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                        Primary role
                      </dt>
                      <dd className="mt-1">{member.roleContext.primaryRole}</dd>
                    </div>
                    <div>
                      <dt className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                        Authorship
                      </dt>
                      <dd className="mt-1">
                        {authoredByLabel(member.roleContext.submissionType)}
                      </dd>
                    </div>
                    {member.roleContext.additionalRoles.length > 0 ? (
                      <div>
                        <dt className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                          Additional roles
                        </dt>
                        <dd className="mt-1">
                          {member.roleContext.additionalRoles.join(", ")}
                        </dd>
                      </div>
                    ) : null}
                    {member.roleContext.responsibilities.length > 0 ? (
                      <div>
                        <dt className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                          Responsibilities
                        </dt>
                        <dd className="mt-1">
                          {member.roleContext.responsibilities.join(", ")}
                        </dd>
                      </div>
                    ) : null}
                    {member.roleContext.additionalContext ? (
                      <div className="sm:col-span-2">
                        <dt className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                          Additional context
                        </dt>
                        <dd className="mt-1 whitespace-pre-wrap">
                          {member.roleContext.additionalContext}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                ) : (
                  <p className="mt-2 text-body text-ink-500">
                    No role context recorded.
                  </p>
                )}

                {member.context.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {member.context.map((context) => (
                      <li
                        key={context.id}
                        className="border-l-2 border-indigo-600 pl-3 text-body text-ink-700"
                      >
                        <p className="whitespace-pre-wrap">{context.contextText}</p>
                        <p className="mt-1 text-eyebrow text-ink-500">
                          {authoredByLabel(context.submissionType)} ·{" "}
                          {formatTimestamp(context.createdAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-body text-ink-500">
                    No additional context recorded.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-3">
          <h2 className="text-subhead font-semibold text-ink-900">
            Limitations
          </h2>
          <ul className="list-disc space-y-2 pl-5 text-body leading-7 text-ink-700">
            {(report?.limitations ?? snapshot.limitations).map(
              (limitation, index) => (
                <li key={`${index}-${limitation}`}>{limitation}</li>
              ),
            )}
          </ul>
          <p className="text-body text-ink-500">
            {report?.disclaimer ?? snapshot.disclaimer}
          </p>
        </div>
      </Card>
    </>
  );
}
