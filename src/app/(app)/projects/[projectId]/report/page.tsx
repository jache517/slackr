import Link from "next/link";
import { notFound } from "next/navigation";

import { Disclosure } from "@/components/disclosure";
import { ExportButton } from "@/components/export-button";
import { WarningIcon } from "@/components/icons";
import {
  Badge,
  Bar,
  ButtonLink,
  Card,
  PageHeader,
  TrendCell,
} from "@/components/ui";
import { getProjectReport } from "@/lib/data/queries";

/** The bar track spans 0 to 40% of recorded activity. */
const AXIS_MAX = 40;
const TICKS = [0, 10, 20, 30, 40];

export default async function ReportPage({
  params,
}: PageProps<"/projects/[projectId]/report">) {
  const { projectId } = await params;
  const report = await getProjectReport(projectId);
  if (!report) notFound();

  const { project, members, totals, evenSplitPercent } = report;
  const lowest = members[members.length - 1];

  return (
    <>
      <PageHeader
        backLink={{
          href: `/projects/${project.id}`,
          label: "Back to Dashboard",
        }}
        meta={[
          project.title,
          "1 to 30 Aug 2025",
          `${totals.events} events`,
          `${members.length} members`,
        ]}
        title="Contribution report"
        actions={<ExportButton />}
      />

      {project.unmatchedAccount ? (
        <Card attention>
          <div className="flex items-center gap-6">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <h2 className="text-subhead font-semibold text-ink-900">
                Before you rely on this
              </h2>
              <p className="flex items-start gap-2 text-body text-amber-800">
                <WarningIcon size={16} className="mt-1 shrink-0" />
                One GitHub account with {project.unmatchedAccount.commits}{" "}
                commits is still matched to nobody, so this report may
                understate someone.
              </p>
            </div>
            <ButtonLink href={`/projects/${project.id}/members`}>
              Match it on Members
            </ButtonLink>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">
            Share of recorded activity
          </h2>
          <p className="max-w-220 text-body text-ink-500">
            Share is a member&apos;s recorded events divided by all
            members&apos; recorded events. One commit, one document edit and one
            attended meeting each count as one event. {totals.events} events
            were recorded between 1 and 30 August. {lowest.name} accounts for{" "}
            {lowest.sharePercent}% of recorded activity, against{" "}
            {evenSplitPercent}% for an even {members.length}-way split. Select a
            name to see how that member compares.
          </p>

          <table className="w-full border-collapse">
            <caption className="pb-3 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
              Share of recorded activity, 1 to 30 August 2025. Bars are drawn on
              a scale of 0 to {AXIS_MAX}%. The dashed line marks an even{" "}
              {members.length}-way split of {evenSplitPercent}%.
            </caption>
            <colgroup>
              <col className="w-[16%]" />
              <col className="w-[8%]" />
              <col className="w-[38%]" />
              <col className="w-[22%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="border-b border-ink-300 pr-4 pb-2.5 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                >
                  Member
                </th>
                <th
                  scope="col"
                  className="border-b border-ink-300 pr-4 pb-2.5 text-right text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                >
                  Share
                </th>
                <th
                  scope="col"
                  className="border-b border-ink-300 pr-4 pb-2.5 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                >
                  0 to {AXIS_MAX}% of activity
                </th>
                <th
                  scope="col"
                  className="border-b border-ink-300 pr-4 pb-2.5 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                >
                  Trend
                </th>
                <th
                  scope="col"
                  className="border-b border-ink-300 pb-2.5 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                >
                  Standing
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => {
                const wellBelow = member.sharePercent < evenSplitPercent / 2;
                const border =
                  index < members.length - 1 ? "border-b border-rule" : "";
                return (
                  <tr key={member.id} className="hover:bg-surface-page">
                    <th
                      scope="row"
                      className={`py-3.5 pr-4 text-left text-body font-medium ${border}`}
                    >
                      <Link
                        href={`/projects/${project.id}/report/${member.slug}`}
                        className="text-indigo-600 underline underline-offset-2 hover:text-indigo-700 hover:decoration-2"
                      >
                        {member.name}
                      </Link>
                    </th>
                    <td
                      data-tabular
                      className={`py-3.5 pr-4 text-right text-body text-ink-900 ${border}`}
                    >
                      {member.sharePercent}%
                    </td>
                    <td className={`py-3.5 pr-4 ${border}`}>
                      <Bar
                        percentOfTrack={(member.sharePercent / AXIS_MAX) * 100}
                        tone={wellBelow ? "amber" : "indigo"}
                        showEvenSplit
                        evenSplitAt={(evenSplitPercent / AXIS_MAX) * 100}
                      />
                    </td>
                    <td className={`py-3.5 pr-4 ${border}`}>
                      <TrendCell
                        points={member.weeklyEvents}
                        trend={member.trend}
                        title={`${member.name}'s weekly activity across August: ${member.trend}, ${member.weeklyEvents[0]} events to ${member.weeklyEvents[member.weeklyEvents.length - 1]}.`}
                      />
                    </td>
                    <td className={`py-3.5 ${border}`}>
                      <Badge tone={wellBelow ? "warn" : "ok"}>
                        {wellBelow ? "Well below" : "In line"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} />
                <td className="pr-4">
                  <div aria-hidden className="relative h-6">
                    {TICKS.map((tick, index) => {
                      const pos = (tick / AXIS_MAX) * 100;
                      return (
                        <span key={tick}>
                          <i
                            className="absolute top-0 h-1.5 w-px bg-ink-300"
                            style={{ left: `${pos}%` }}
                          />
                          <span
                            data-tabular
                            className="absolute top-2.5 text-eyebrow font-semibold tracking-[0.06em] whitespace-nowrap text-ink-500"
                            style={
                              index === 0
                                ? { left: 0 }
                                : index === TICKS.length - 1
                                  ? { right: 0 }
                                  : {
                                      left: `${pos}%`,
                                      transform: "translateX(-50%)",
                                    }
                            }
                          >
                            {tick === AXIS_MAX ? `${tick}%` : tick}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      <Card>
        <Disclosure
          showLabel="Show the raw counts"
          hideLabel="Hide the raw counts"
        >
          <div className="flex flex-col gap-4">
            <h3 className="text-section font-semibold text-ink-900">
              Raw counts
            </h3>
            <table className="w-full border-collapse">
              <caption className="pb-3 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                Everything recorded for each member between 1 and 30 August
                2025. Events = commits + document edits + meetings attended;{" "}
                {totals.events} in total.
              </caption>
              <thead>
                <tr>
                  {[
                    "Member",
                    "Commits",
                    "Doc activity",
                    "Meetings",
                    "Last active",
                    "Share",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="border-b border-ink-300 pr-4 pb-2.5 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => {
                  const border =
                    index < members.length - 1 ? "border-b border-rule" : "";
                  return (
                    <tr key={member.id}>
                      <th
                        scope="row"
                        className={`py-3 pr-4 text-left text-body font-medium text-ink-900 ${border}`}
                      >
                        {member.name}
                      </th>
                      <td
                        data-tabular
                        className={`py-3 pr-4 text-body text-ink-500 ${border}`}
                      >
                        {member.commits}
                      </td>
                      <td
                        data-tabular
                        className={`py-3 pr-4 text-body text-ink-500 ${border}`}
                      >
                        {member.docActivity}
                      </td>
                      <td
                        data-tabular
                        className={`py-3 pr-4 text-body text-ink-500 ${border}`}
                      >
                        {member.meetingsAttended} of {project.meetingsHeld}
                      </td>
                      <td className={`py-3 pr-4 text-body text-ink-500 ${border}`}>
                        {member.lastActive}
                      </td>
                      <td
                        data-tabular
                        className={`py-3 text-body text-ink-500 ${border}`}
                      >
                        {member.sharePercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Disclosure>
      </Card>
    </>
  );
}
