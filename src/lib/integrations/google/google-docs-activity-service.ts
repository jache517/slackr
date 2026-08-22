import "server-only";

import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  classifyGoogleDriveActivityType,
  extractGoogleDriveActivityId,
  extractGoogleDriveActivityTimestamp,
  extractGoogleDriveActorEmail,
  fetchGoogleDriveActivityPage,
} from "@/lib/integrations/google/document-client";
import {
  getGoogleDocsActivitySyncScope,
  insertGoogleDocsActivityRows,
  updateGoogleDocsSourceSyncSuccess,
} from "@/lib/integrations/google/google-docs-activity-repository";
import type { SourceConnection } from "@/types/api";
import type { Database } from "@/types/database";

const GOOGLE_ACTIVITY_MAX_PAGES = 20;

type GoogleDocsActivitySyncFailureReason =
  | "source_not_connected"
  | "rate_limited"
  | "document_not_accessible"
  | "provider_error"
  | "malformed_payload"
  | "partial_failure"
  | "database_error";

type GoogleDocsActivitySyncFailure = {
  ok: false;
  reason: GoogleDocsActivitySyncFailureReason;
  insertedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  startedAt: string;
  completedAt: string | null;
};

type GoogleDocsActivitySyncSuccess = {
  ok: true;
  source: SourceConnection;
  insertedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  startedAt: string;
  completedAt: string;
};

export type GoogleDocsActivitySyncResult =
  | GoogleDocsActivitySyncSuccess
  | GoogleDocsActivitySyncFailure;

function partialFailure(
  reason: GoogleDocsActivitySyncFailureReason,
  insertedCount: number,
  matchedCount: number,
  unmatchedCount: number,
  startedAt: string,
): GoogleDocsActivitySyncFailure {
  return {
    ok: false,
    reason,
    insertedCount,
    matchedCount,
    unmatchedCount,
    startedAt,
    completedAt: null,
  };
}

function toGoogleEmailMap(
  members: Array<{ id: string; google_email: string | null }>,
) {
  const byEmail = new Map<string, string>();

  for (const member of members) {
    if (member.google_email) {
      byEmail.set(member.google_email.trim().toLowerCase(), member.id);
    }
  }

  return byEmail;
}

function stableActivityId(
  activity: Record<string, unknown>,
  activityType: string,
  occurredAt: string,
  actorEmail: string | null,
) {
  const providerId = extractGoogleDriveActivityId(activity);

  if (providerId) return providerId;

  const fingerprint = JSON.stringify({
    activityType,
    occurredAt,
    actorEmail,
    primaryActionDetail: activity.primaryActionDetail ?? null,
    actions: activity.actions ?? null,
    targets: activity.targets ?? null,
  });

  return `derived:${createHash("sha256").update(fingerprint).digest("hex")}`;
}

function normalizeActivityRows(
  projectId: string,
  sourceConnectionId: string,
  activities: unknown[],
  memberIdsByEmail: Map<string, string>,
) {
  const rows: Database["public"]["Tables"]["docs_activity"]["Insert"][] = [];
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const candidate of activities) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      return { ok: false as const, reason: "malformed_payload" as const };
    }

    const activity = candidate as Record<string, unknown>;
    const activityType = classifyGoogleDriveActivityType(activity);

    if (!activityType) continue;

    const occurredAt = extractGoogleDriveActivityTimestamp(activity);

    if (!occurredAt) {
      return { ok: false as const, reason: "malformed_payload" as const };
    }

    const actorEmail = extractGoogleDriveActorEmail(activity);
    const memberId = actorEmail ? memberIdsByEmail.get(actorEmail) ?? null : null;

    if (memberId) matchedCount += 1;
    else unmatchedCount += 1;

    rows.push({
      project_id: projectId,
      source_connection_id: sourceConnectionId,
      member_id: memberId,
      activity_type: activityType,
      actor_email: actorEmail,
      provider_activity_id: stableActivityId(
        activity,
        activityType,
        occurredAt,
        actorEmail,
      ),
      occurred_at: occurredAt,
    });
  }

  return { ok: true as const, rows, matchedCount, unmatchedCount };
}

export async function syncGoogleDocsActivityForProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
  accessToken: string,
  documentId: string,
): Promise<GoogleDocsActivitySyncResult> {
  const startedAt = new Date().toISOString();
  const scope = await getGoogleDocsActivitySyncScope(supabase, projectId);

  if (!scope.ok) {
    return partialFailure(
      scope.reason === "not_found" ? "source_not_connected" : "database_error",
      0,
      0,
      0,
      startedAt,
    );
  }

  if (scope.source.externalId !== documentId) {
    return partialFailure("database_error", 0, 0, 0, startedAt);
  }

  const memberIdsByEmail = toGoogleEmailMap(scope.members);
  let pageToken: string | null = null;
  let insertedCount = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;
  let completed = false;

  for (let page = 1; page <= GOOGLE_ACTIVITY_MAX_PAGES; page += 1) {
    const pageResult = await fetchGoogleDriveActivityPage({
      accessToken,
      documentId,
      pageToken,
    });

    if (!pageResult.ok) {
      return partialFailure(
        insertedCount > 0 || page > 1 ? "partial_failure" : pageResult.reason,
        insertedCount,
        matchedCount,
        unmatchedCount,
        startedAt,
      );
    }

    const normalized = normalizeActivityRows(
      projectId,
      scope.source.id,
      pageResult.activities,
      memberIdsByEmail,
    );

    if (!normalized.ok) {
      return partialFailure(
        insertedCount > 0 || page > 1 ? "partial_failure" : normalized.reason,
        insertedCount,
        matchedCount,
        unmatchedCount,
        startedAt,
      );
    }

    const persisted = await insertGoogleDocsActivityRows(supabase, normalized.rows);

    if (!persisted.ok) {
      return partialFailure(
        insertedCount > 0 || page > 1 ? "partial_failure" : "database_error",
        insertedCount,
        matchedCount,
        unmatchedCount,
        startedAt,
      );
    }

    insertedCount += normalized.rows.length;
    matchedCount += normalized.matchedCount;
    unmatchedCount += normalized.unmatchedCount;
    pageToken = pageResult.nextPageToken;

    if (!pageToken) {
      completed = true;
      break;
    }
  }

  if (!completed) {
    return partialFailure(
      "partial_failure",
      insertedCount,
      matchedCount,
      unmatchedCount,
      startedAt,
    );
  }

  const completedAt = new Date().toISOString();
  const sourceResult = await updateGoogleDocsSourceSyncSuccess(
    supabase,
    scope.source.id,
    completedAt,
  );

  if (!sourceResult.ok) {
    return partialFailure(
      "database_error",
      insertedCount,
      matchedCount,
      unmatchedCount,
      startedAt,
    );
  }

  return {
    ok: true,
    source: sourceResult.source,
    insertedCount,
    matchedCount,
    unmatchedCount,
    startedAt,
    completedAt,
  };
}
