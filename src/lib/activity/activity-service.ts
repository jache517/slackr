import "server-only";

import type {
  ActivityMemberSummary,
  ActivitySourceStates,
  EvidenceAlert,
  GoogleDocsActivitySummary,
  GithubActivitySummary,
  ProjectActivity,
  SourceProviderError,
  SourceState,
} from "@/types/api";

import type {
  ActivityDocsRow,
  ActivityGithubRow,
  ActivityMemberContextRow,
  ActivityMemberRow,
  ActivityMemberRoleContextRow,
  ActivityScopeSuccess,
  ActivityScope,
  ActivitySourceConnectionRow,
} from "./activity-repository";

type ActivitySourceType = "github" | "googleDocs";

const ALERT_ORDER = [
  "SOURCE_UNAVAILABLE",
  "SOURCE_IDENTITY_NOT_MAPPED",
  "ROLE_CONTEXT_MISSING",
  "MISSING_WORK_CONTEXT",
] as const;

function toSourceType(sourceType: "github" | "google_docs"): ActivitySourceType {
  return sourceType === "google_docs" ? "googleDocs" : "github";
}

function isActivitySourceRow(
  row: ActivityScopeSuccess["sourceConnections"][number],
): row is ActivitySourceConnectionRow {
  return row.source_type === "github" || row.source_type === "google_docs";
}

function latestTimestamp(values: Array<string | null>) {
  return [...values].filter((value): value is string => Boolean(value)).sort().at(-1) ?? null;
}

function sourceErrorToPublic(row: {
  sync_error_code: string | null;
  sync_error_message: string | null;
}): SourceProviderError | null {
  if (!row.sync_error_code || !row.sync_error_message) {
    return null;
  }

  return {
    code: row.sync_error_code,
    message: row.sync_error_message,
  };
}

function sourceStateFor<TSourceType extends ActivitySourceType>(
  sourceType: TSourceType,
  sourceConnection: {
    id: string;
    project_id: string;
    source_type: "github" | "google_docs";
    external_id: string;
    display_name: string;
    connected_at: string;
    last_synced_at: string | null;
    sync_error_code: string | null;
    sync_error_message: string | null;
    sync_error_at: string | null;
  } | null,
  hasRetainedEvidence: boolean,
): SourceState<TSourceType> {
  if (!sourceConnection) {
    return {
      sourceType,
      status: "unconnected",
      connection: null,
      isStale: false,
      error: null,
    };
  }

  const connection = {
    id: sourceConnection.id,
    projectId: sourceConnection.project_id,
    sourceType,
    externalId: sourceConnection.external_id,
    displayName: sourceConnection.display_name,
    connectedAt: sourceConnection.connected_at,
    lastSyncedAt: sourceConnection.last_synced_at,
  };
  const error = sourceErrorToPublic(sourceConnection);

  if (error) {
    return {
      sourceType,
      status: "failed",
      connection,
      isStale: hasRetainedEvidence,
      error,
    };
  }

  return {
    sourceType,
    status: "connected",
    connection,
    isStale: false,
    error: null,
  };
}

function buildSourceStates(scope: ActivityScope): ActivitySourceStates {
  const success = scope as ActivityScopeSuccess;
  const activitySources = success.sourceConnections.filter(isActivitySourceRow);
  const githubConnection = activitySources.find((row) => row.source_type === "github") ?? null;
  const googleDocsConnection = activitySources.find((row) => row.source_type === "google_docs") ?? null;

  return {
    github: sourceStateFor(
      "github",
      githubConnection,
      success.githubActivity.length > 0,
    ),
    googleDocs: sourceStateFor(
      "googleDocs",
      googleDocsConnection,
      success.docsActivity.length > 0,
    ),
  };
}

function githubRowsForMember(rows: ActivityGithubRow[], memberId: string) {
  return rows.filter((row) => row.member_id === memberId);
}

function docsRowsForMember(rows: ActivityDocsRow[], memberId: string) {
  return rows.filter((row) => row.member_id === memberId);
}

function buildGithubSummary(
  state: SourceState<"github">,
  rows: ActivityGithubRow[],
): GithubActivitySummary | null {
  if (state.status === "unconnected" || (state.status === "failed" && rows.length === 0)) {
    return null;
  }

  return {
    commitCount: rows.length,
    lastActiveAt: latestTimestamp(rows.map((row) => row.authored_at)),
  };
}

function buildGoogleDocsSummary(
  state: SourceState<"googleDocs">,
  rows: ActivityDocsRow[],
): GoogleDocsActivitySummary | null {
  if (state.status === "unconnected" || (state.status === "failed" && rows.length === 0)) {
    return null;
  }

  return {
    activityCount: rows.length,
    editCount: rows.filter((row) => row.activity_type === "edit").length,
    commentCount: rows.filter((row) => row.activity_type === "comment").length,
    suggestionCount: rows.filter((row) => row.activity_type === "suggestion").length,
    lastActiveAt: latestTimestamp(rows.map((row) => row.occurred_at)),
  };
}

function evidenceAlertsForMember(input: {
  githubState: SourceState<"github">;
  googleDocsState: SourceState<"googleDocs">;
  member: ActivityMemberRow;
  roleContext: ActivityMemberRoleContextRow | null;
  contexts: ActivityMemberContextRow[];
}): EvidenceAlert[] {
  const alerts: EvidenceAlert[] = [];

  if (input.githubState.status === "failed" || input.googleDocsState.status === "failed") {
    alerts.push({
      code: "SOURCE_UNAVAILABLE",
      level: "attention",
      message: "Source unavailable",
      sourceTypes: [
        ...(input.githubState.status === "failed" ? (["github"] as const) : []),
        ...(input.googleDocsState.status === "failed" ? (["googleDocs"] as const) : []),
      ],
    });
  }

  if (input.githubState.status === "connected" && input.member.github_username === null) {
    alerts.push({
      code: "SOURCE_IDENTITY_NOT_MAPPED",
      level: "attention",
      message: "Identity not mapped",
      sourceTypes: ["github" as const],
    });
  }

  if (input.googleDocsState.status === "connected" && input.member.google_email === null) {
    alerts.push({
      code: "SOURCE_IDENTITY_NOT_MAPPED",
      level: "attention",
      message: "Identity not mapped",
      sourceTypes: ["googleDocs" as const],
    });
  }

  if (!input.roleContext) {
    alerts.push({
      code: "ROLE_CONTEXT_MISSING",
      level: "attention",
      message: "Role context not recorded",
      sourceTypes: [],
    });
  }

  if (input.contexts.length === 0) {
    alerts.push({
      code: "MISSING_WORK_CONTEXT",
      level: "attention",
      message: "Context not recorded",
      sourceTypes: [],
    });
  }

  return alerts.sort(
    (a, b) => ALERT_ORDER.indexOf(a.code as (typeof ALERT_ORDER)[number]) - ALERT_ORDER.indexOf(b.code as (typeof ALERT_ORDER)[number]),
  );
}

export function buildProjectActivity(scope: ActivityScope): ProjectActivity {
  if (!scope.ok) {
    throw new Error("Activity scope is unavailable");
  }

  const sourceStates = buildSourceStates(scope);

  return {
    projectId: scope.project.id,
    generatedAt: new Date().toISOString(),
    sourceStates,
    members: scope.members.map((member) => {
      const githubRows = githubRowsForMember(scope.githubActivity, member.id);
      const docsRows = docsRowsForMember(scope.docsActivity, member.id);
      const github = buildGithubSummary(sourceStates.github, githubRows);
      const googleDocs = buildGoogleDocsSummary(sourceStates.googleDocs, docsRows);
      const roleContext = scope.memberRoleContexts.find((row) => row.member_id === member.id) ?? null;
      const contexts = scope.memberContexts.filter((row) => row.member_id === member.id);

      return {
        memberId: member.id,
        name: member.name,
        lastActiveAt: latestTimestamp([
          github?.lastActiveAt ?? null,
          googleDocs?.lastActiveAt ?? null,
        ]),
        github,
        googleDocs,
        evidenceAlerts: evidenceAlertsForMember({
          githubState: sourceStates.github,
          googleDocsState: sourceStates.googleDocs,
          member,
          roleContext,
          contexts,
        }),
      } satisfies ActivityMemberSummary;
    }),
  };
}

export function buildActivitySourceStates(scope: ActivityScope): ActivitySourceStates {
  if (!scope.ok) {
    throw new Error("Activity scope is unavailable");
  }

  return buildSourceStates(scope);
}

export function mapSourceTypeToActivity(sourceType: "github" | "google_docs") {
  return toSourceType(sourceType);
}
