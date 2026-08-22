import "server-only";

import { mapMemberContext } from "@/lib/context/context-mapper";
import {
  mapActivitySourceConnection,
} from "@/lib/activity/activity-repository";
import { buildActivitySourceStates } from "@/lib/activity/activity-service";
import type {
  ActivityDocsRow,
  ActivityGithubRow,
  ActivityScopeSuccess,
} from "@/lib/activity/activity-repository";
import { mapMemberRoleContext, mapProject } from "@/lib/projects/project-mapper";
import type {
  CanonicalEvidenceSnapshot,
  ContributionReportMember,
  GithubReportEvidence,
  GoogleDocsReportEvidence,
} from "@/types/api";

import {
  isTimestampInPeriod,
  type ReportPeriod,
} from "./report-validation";
import { buildReportVisualisations } from "./report-visualisations";

const REPORT_DISCLAIMER =
  "Slackr presents observable evidence and authored context for instructor review. It does not determine contribution quality, rank members, or assign a grade.";

function latestTimestamp(values: Array<string | null>) {
  return (
    [...values]
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null
  );
}

function buildGithubEvidence(
  rows: ActivityGithubRow[],
  state: ReturnType<typeof buildActivitySourceStates>["github"],
): GithubReportEvidence | null {
  if (state.status === "unconnected" || (state.status === "failed" && rows.length === 0)) {
    return null;
  }

  return {
    commitCount: rows.length,
    lastActiveAt: latestTimestamp(rows.map((row) => row.authored_at)),
    items: rows
      .sort((a, b) => a.authored_at.localeCompare(b.authored_at))
      .map((row) => ({
        evidenceRef: `github:commit:${row.commit_sha}`,
        sha: row.commit_sha,
        message: row.commit_message,
        timestamp: row.authored_at,
      })),
  };
}

function buildGoogleDocsEvidence(
  rows: ActivityDocsRow[],
  state: ReturnType<typeof buildActivitySourceStates>["googleDocs"],
): GoogleDocsReportEvidence | null {
  if (state.status === "unconnected" || (state.status === "failed" && rows.length === 0)) {
    return null;
  }

  return {
    activityCount: rows.length,
    editCount: rows.filter((row) => row.activity_type === "edit").length,
    commentCount: rows.filter((row) => row.activity_type === "comment").length,
    suggestionCount: rows.filter((row) => row.activity_type === "suggestion").length,
    lastActiveAt: latestTimestamp(rows.map((row) => row.occurred_at)),
    items: rows
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
      .map((row) => {
        const stableId = row.provider_activity_id ?? row.id;
        return {
          evidenceRef: `googleDocs:activity:${stableId}`,
          id: row.id,
          activityType: row.activity_type,
          timestamp: row.occurred_at,
        };
      }),
  };
}

function rowsForPeriod(
  scope: ActivityScopeSuccess,
  period: ReportPeriod,
) {
  return {
    github: scope.githubActivity.filter(
      (row) => row.member_id && isTimestampInPeriod(row.authored_at, period),
    ),
    googleDocs: scope.docsActivity.filter(
      (row) => row.member_id && isTimestampInPeriod(row.occurred_at, period),
    ),
  };
}

function buildLimitations(
  scope: ActivityScopeSuccess,
  sourceStates: ReturnType<typeof buildActivitySourceStates>,
  period: ReportPeriod,
  periodRows: ReturnType<typeof rowsForPeriod>,
) {
  const limitations: string[] = [];

  for (const sourceType of ["github", "googleDocs"] as const) {
    const state = sourceStates[sourceType];
    const label = sourceType === "github" ? "GitHub" : "Google Docs";

    if (state.status === "unconnected") {
      limitations.push(`${label} is not connected, so no evidence is available from that source.`);
    }

    if (state.status === "failed") {
      limitations.push(
        `${label} collection failed for this source; any retained evidence may be stale.`,
      );
    }
  }

  const unmatchedGithub = scope.githubActivity.filter(
    (row) =>
      !row.member_id &&
      isTimestampInPeriod(row.authored_at, period),
  ).length;

  const unmatchedDocs = scope.docsActivity.filter(
    (row) =>
      !row.member_id &&
      isTimestampInPeriod(row.occurred_at, period),
  ).length;

  if (unmatchedGithub > 0) {
    limitations.push(
      `${unmatchedGithub} GitHub commit${unmatchedGithub === 1 ? "" : "s"} in the selected period could not be matched to a member.`,
    );
  }

  if (unmatchedDocs > 0) {
    limitations.push(
      `${unmatchedDocs} Google Docs activit${unmatchedDocs === 1 ? "y" : "ies"} in the selected period could not be matched to a member.`,
    );
  }

  if (
    periodRows.github.length === 0 &&
    periodRows.googleDocs.length === 0
  ) {
    limitations.push(
      "No matched GitHub or Google Docs activity was observed in the selected period.",
    );
  }

  limitations.push(
    "Role, responsibility, and member context are authored context. They help explain evidence gaps but do not prove that work was completed.",
  );

  return limitations;
}

export function buildCanonicalEvidenceSnapshot(
  scope: ActivityScopeSuccess,
  period: ReportPeriod,
  generatedAt = new Date().toISOString(),
): CanonicalEvidenceSnapshot {
  const sourceStates = buildActivitySourceStates(scope);
  const periodRows = rowsForPeriod(scope, period);
  const roleContextByMemberId = new Map(
    scope.memberRoleContexts.map((row) => [
      row.member_id,
      mapMemberRoleContext(row),
    ]),
  );
  const contextByMemberId = new Map<string, ReturnType<typeof mapMemberContext>[]>();

  for (const row of scope.memberContexts) {
    const contexts = contextByMemberId.get(row.member_id) ?? [];
    contexts.push(mapMemberContext(row));
    contextByMemberId.set(row.member_id, contexts);
  }

  const members: ContributionReportMember[] = scope.members.map((member) => {
    const githubRows = periodRows.github.filter(
      (row) => row.member_id === member.id,
    );
    const googleDocsRows = periodRows.googleDocs.filter(
      (row) => row.member_id === member.id,
    );

    const roleContext = roleContextByMemberId.get(member.id) ?? null;

    return {
      memberId: member.id,
      name: member.name,
      roleContext: roleContext
        ? {
            memberId: roleContext.memberId,
            primaryRole: roleContext.primaryRole,
            additionalRoles: roleContext.additionalRoles,
            responsibilities: roleContext.responsibilities,
            additionalContext: roleContext.additionalContext,
            submissionType: roleContext.submissionType,
            updatedAt: roleContext.updatedAt,
          }
        : null,
      evidence: {
        github: buildGithubEvidence(githubRows, sourceStates.github),
        googleDocs: buildGoogleDocsEvidence(
          googleDocsRows,
          sourceStates.googleDocs,
        ),
      },
      context: (contextByMemberId.get(member.id) ?? []).map(
        ({ id, contextText, submissionType, createdAt }) => ({
          id,
          contextText,
          submissionType,
          createdAt,
        }),
      ),
    };
  });

  const visualisations = buildReportVisualisations(members, sourceStates);
  const limitations = buildLimitations(
    scope,
    sourceStates,
    period,
    periodRows,
  );

  return {
    project: mapProject(
      scope.project,
      scope.members.length,
      scope.sourceConnections.length,
    ),
    monitoringPeriod: period,
    generatedAt,
    connectedSources: scope.sourceConnections.map(mapActivitySourceConnection),
    sourceStates,
    members,
    visualisations,
    limitations,
    disclaimer: REPORT_DISCLAIMER,
  };
}
