import "server-only";

import type {
  ContributionReportMember,
  ReportVisualisation,
  ActivitySourceStates,
} from "@/types/api";

export type ReportVisualisationMetadata = {
  id: ReportVisualisation["id"];
  title: string;
  caption: string;
};

export function buildReportVisualisations(
  members: ContributionReportMember[],
  sourceStates: ActivitySourceStates,
): ReportVisualisation[] {
  const series = members.flatMap((member) => {
    const values: Array<{
      sourceType: "github" | "googleDocs";
      metric: "commitCount" | "activityCount";
      label: string;
      value: number;
    }> = [];

    if (
      sourceStates.github.status === "connected" ||
      (sourceStates.github.status === "failed" && member.evidence.github)
    ) {
      values.push({
        sourceType: "github",
        metric: "commitCount",
        label: member.name,
        value: member.evidence.github?.commitCount ?? 0,
      });
    }

    if (
      sourceStates.googleDocs.status === "connected" ||
      (sourceStates.googleDocs.status === "failed" && member.evidence.googleDocs)
    ) {
      values.push({
        sourceType: "googleDocs",
        metric: "activityCount",
        label: member.name,
        value: member.evidence.googleDocs?.activityCount ?? 0,
      });
    }

    return values;
  });

  const timeline = members
    .flatMap((member) => [
      ...(member.evidence.github?.items.map((item) => ({
        memberId: member.memberId,
        memberName: member.name,
        sourceType: "github" as const,
        activityType: "commit" as const,
        timestamp: item.timestamp,
        evidenceRef: item.evidenceRef,
      })) ?? []),
      ...(member.evidence.googleDocs?.items.map((item) => ({
        memberId: member.memberId,
        memberName: member.name,
        sourceType: "googleDocs" as const,
        activityType: item.activityType,
        timestamp: item.timestamp,
        evidenceRef: item.evidenceRef,
      })) ?? []),
    ])
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return [
    {
      id: "sourceActivityByMember",
      type: "groupedBar",
      title: "Recorded activity by source",
      caption:
        "GitHub commits and Google Docs activity remain separate evidence dimensions.",
      series,
    },
    {
      id: "activityTimeline",
      type: "timeline",
      title: "Activity timeline",
      caption: "Timestamped evidence items from the selected monitoring period.",
      items: timeline,
    },
    {
      id: "sourceStates",
      type: "sourceState",
      title: "Source availability",
      caption: "Source connection and stale-evidence states for this report.",
      sources: (["github", "googleDocs"] as const).map((sourceType) => {
        const state = sourceStates[sourceType];
        return {
          sourceType,
          status: state.status,
          isStale: state.isStale,
        };
      }),
    },
  ];
}

export function applyVisualisationMetadata(
  visualisations: ReportVisualisation[],
  metadata: ReportVisualisationMetadata[],
) {
  const metadataById = new Map(metadata.map((item) => [item.id, item]));

  return visualisations.map((visualisation) => {
    const item = metadataById.get(visualisation.id);

    if (!item) {
      return visualisation;
    }

    return {
      ...visualisation,
      title: item.title,
      caption: item.caption,
    };
  });
}
