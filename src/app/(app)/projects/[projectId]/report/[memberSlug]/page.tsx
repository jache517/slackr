import { notFound } from "next/navigation";

import { Disclosure } from "@/components/disclosure";
import { QuoteIcon } from "@/components/icons";
import { Bar, Button, Card, PageHeader, StatTile } from "@/components/ui";
import { getMemberDetail } from "@/lib/data/queries";

type Measure = {
  key: string;
  heading: string;
  scaleLabel: string;
  scaleMax: number;
  memberCount: number;
  memberDisplay: string;
  medianCount: number;
  medianDisplay: string;
};

export default async function MemberDetailPage({
  params,
}: PageProps<"/projects/[projectId]/report/[memberSlug]">) {
  const { projectId, memberSlug } = await params;
  const detail = await getMemberDetail(projectId, memberSlug);
  if (!detail) notFound();

  const { project, member, medians, totals, evenSplitPercent } = detail;
  const firstName = member.name.split(" ")[0];

  const measures: Measure[] = [
    {
      key: "commits",
      heading: "GitHub commits",
      scaleLabel: "scale 0 to 20 commits",
      scaleMax: 20,
      memberCount: member.commits,
      memberDisplay: String(member.commits),
      medianCount: medians.commits,
      medianDisplay: String(medians.commits),
    },
    {
      key: "docs",
      heading: "Google Docs edits",
      scaleLabel: "scale 0 to 20 edits",
      scaleMax: 20,
      memberCount: member.docEdits,
      memberDisplay: String(member.docEdits),
      medianCount: medians.docEdits,
      medianDisplay: String(medians.docEdits),
    },
    {
      key: "meetings",
      heading: "Meetings attended",
      scaleLabel: `scale 0 to ${project.meetingsHeld} meetings`,
      scaleMax: project.meetingsHeld,
      memberCount: member.meetingsAttended,
      memberDisplay: `${member.meetingsAttended} of ${project.meetingsHeld}`,
      medianCount: medians.meetings,
      medianDisplay: `${medians.meetings} of ${project.meetingsHeld}`,
    },
  ];

  return (
    <>
      <PageHeader
        backLink={{
          href: `/projects/${project.id}/report`,
          label: "Back to Report",
        }}
        meta={[
          member.name,
          project.code,
          "1 to 30 Aug 2025",
          `${member.sharePercent}% share`,
          `even split ${evenSplitPercent}%`,
        ]}
        title={`${firstName} recorded far less activity than the rest of the group.`}
        actions={<Button>Ask {firstName} for context</Button>}
      />

      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-subhead font-semibold text-ink-900">
              {firstName} compared with the group median
            </h2>
            <p className="max-w-220 text-body text-ink-500">
              Group median means the middle value for the other{" "}
              {detail.members.length - 1} members. Each row is drawn on its own
              scale, shown at the right of the row.
            </p>
          </div>

          {measures.map((measure) => {
            const memberPct =
              measure.medianCount === 0
                ? 0
                : Math.round((measure.memberCount / measure.medianCount) * 100);
            return (
              <div key={measure.key} className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-section font-semibold text-ink-900">
                    {measure.heading}
                  </h3>
                  <p className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                    {measure.scaleLabel}
                  </p>
                </div>

                <table className="w-full border-collapse">
                  <caption className="pb-2 text-left text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                    {measure.heading}, scale 0 to {measure.scaleMax}.
                  </caption>
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[40%]" />
                    <col className="w-[14%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Who</th>
                      <th scope="col">{measure.scaleLabel}</th>
                      <th scope="col">Count</th>
                      <th scope="col">Share of median</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th
                        scope="row"
                        className="py-2 pr-4 text-left text-body font-semibold text-ink-900"
                      >
                        {firstName}
                      </th>
                      <td className="py-2 pr-4">
                        <Bar
                          percentOfTrack={
                            (measure.memberCount / measure.scaleMax) * 100
                          }
                          tone="amber"
                        />
                      </td>
                      <td
                        data-tabular
                        className="py-2 pr-4 text-right text-body font-semibold text-ink-900"
                      >
                        {measure.memberDisplay}
                      </td>
                      <td
                        data-tabular
                        className="py-2 text-right text-body text-ink-500"
                      >
                        {memberPct}% of median
                      </td>
                    </tr>
                    <tr>
                      <th
                        scope="row"
                        className="py-2 pr-4 text-left text-body text-ink-500"
                      >
                        Group median
                      </th>
                      <td className="py-2 pr-4">
                        <div
                          aria-hidden
                          className="h-3.5 rounded-full bg-surface-track shadow-[inset_0_0_0_1px_var(--color-ink-300)]"
                        >
                          <div
                            className="h-3.5 rounded-full border-2 border-indigo-600 bg-surface-card"
                            style={{
                              width: `${(measure.medianCount / measure.scaleMax) * 100}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td
                        data-tabular
                        className="py-2 pr-4 text-right text-body text-ink-500"
                      >
                        {measure.medianDisplay}
                      </td>
                      <td
                        data-tabular
                        className="py-2 text-right text-body text-ink-500"
                      >
                        100%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <QuoteIcon size={18} />
            <h2 className="text-subhead font-semibold text-ink-900">
              {firstName}&apos;s own note
            </h2>
          </div>
          <div className="flex flex-col gap-3 rounded-tile bg-tint-indigo px-6 py-5">
            <figure className="flex flex-col gap-3">
              <blockquote className="font-serif text-quote text-indigo-700 italic">
                I ran the five user interviews off-platform and built the
                presentation in Figma, so none of it shows up in GitHub or Docs.
              </blockquote>
              <figcaption className="text-body text-ink-500">
                Added 20 Aug 2025. Not verified by Slackr.
              </figcaption>
            </figure>
          </div>
        </div>
      </Card>

      <Card>
        <Disclosure
          showLabel="Show every recorded number"
          hideLabel="Hide every recorded number"
        >
          <div className="flex flex-col gap-4">
            <h3 className="text-section font-semibold text-ink-900">
              Every recorded number
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <StatTile value={String(member.commits)} label="Commits" />
              <StatTile value={String(member.docEdits)} label="Doc edits" />
              <StatTile
                value={`${member.meetingsAttended} of ${project.meetingsHeld}`}
                label="Meetings attended"
              />
              <StatTile value={String(member.events)} label="Recorded events" />
              <StatTile
                value={`${member.sharePercent}%`}
                label="Share of recorded activity"
              />
              <StatTile value={`${evenSplitPercent}%`} label="Even split" />
              <StatTile value={member.lastActive} label="Last active" />
              <StatTile
                value={String(totals.events)}
                label="Group total events"
              />
            </div>
          </div>
        </Disclosure>
      </Card>
    </>
  );
}
