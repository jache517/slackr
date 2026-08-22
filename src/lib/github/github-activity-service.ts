import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  fetchGithubCommitPage,
  type GithubCommit,
} from "@/lib/integrations/github/commit-client";
import { getGithubActivitySyncScope, insertGithubActivityRows, updateGithubSourceLastSyncedAt } from "@/lib/github/github-activity-repository";
import type { SourceConnection } from "@/types/api";
import type { Database } from "@/types/database";

const GITHUB_COMMITS_MAX_PAGES = 20;

type GithubActivitySyncFailureReason =
  | "source_not_connected"
  | "rate_limited"
  | "provider_error"
  | "malformed_payload"
  | "partial_failure"
  | "database_error";

type GithubActivitySyncFailure = {
  ok: false;
  reason: GithubActivitySyncFailureReason;
  insertedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  startedAt: string;
  completedAt: string | null;
};

type GithubActivitySyncSuccess = {
  ok: true;
  source: SourceConnection;
  insertedCount: number;
  matchedCount: number;
  unmatchedCount: number;
  startedAt: string;
  completedAt: string;
};

export type GithubActivitySyncResult =
  | GithubActivitySyncSuccess
  | GithubActivitySyncFailure;

function toGithubUsernameMap(
  members: Array<{ id: string; github_username: string | null }>,
) {
  const byUsername = new Map<string, string>();

  for (const member of members) {
    if (member.github_username) {
      byUsername.set(member.github_username.toLowerCase(), member.id);
    }
  }

  return byUsername;
}

function parseGithubExternalId(externalId: string) {
  const parts = externalId.split("/");
  const [owner, repository] = parts;

  if (parts.length !== 2 || !owner || !repository) {
    return null;
  }

  return { owner, repository };
}

function toGithubActivityRows(
  projectId: string,
  sourceConnectionId: string,
  commits: GithubCommit[],
  memberIdsByLogin: Map<string, string>,
) {
  let matchedCount = 0;
  let unmatchedCount = 0;

  const rows = commits.map((commit) => {
    const memberId = commit.authorLogin
      ? memberIdsByLogin.get(commit.authorLogin.toLowerCase()) ?? null
      : null;

    if (memberId) {
      matchedCount += 1;
    } else {
      unmatchedCount += 1;
    }

    return {
      project_id: projectId,
      source_connection_id: sourceConnectionId,
      member_id: memberId,
      commit_sha: commit.sha,
      commit_message: commit.message,
      author_name: commit.authorName,
      author_email: commit.authorEmail,
      authored_at: commit.authoredAt,
    };
  });

  return { rows, matchedCount, unmatchedCount };
}

function partialFailure(
  reason: GithubActivitySyncFailureReason,
  insertedCount: number,
  matchedCount: number,
  unmatchedCount: number,
  startedAt: string,
): GithubActivitySyncFailure {
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

export async function syncGithubActivityForProject(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<GithubActivitySyncResult> {
  const startedAt = new Date().toISOString();
  const scope = await getGithubActivitySyncScope(supabase, projectId);

  if (!scope.ok) {
    return scope.reason === "not_found"
      ? partialFailure("source_not_connected", 0, 0, 0, startedAt)
      : partialFailure("database_error", 0, 0, 0, startedAt);
  }

  const memberIdsByLogin = toGithubUsernameMap(scope.members);
  const reference = parseGithubExternalId(scope.source.externalId);

  if (!reference) {
    return partialFailure("database_error", 0, 0, 0, startedAt);
  }

  let insertedCount = 0;
  let matchedCount = 0;
  let unmatchedCount = 0;
  let completed = false;

  for (let page = 1; page <= GITHUB_COMMITS_MAX_PAGES; page += 1) {
    const pageResult = await fetchGithubCommitPage(
      {
        owner: reference.owner,
        repository: reference.repository,
        externalId: scope.source.externalId,
        canonicalUrl: `https://github.com/${scope.source.externalId}`,
      },
      { since: scope.projectCreatedAt, until: startedAt },
      page,
    );

    if (!pageResult.ok) {
      const reason =
        insertedCount > 0 || page > 1
          ? "partial_failure"
          : pageResult.reason;

      return partialFailure(
        reason,
        insertedCount,
        matchedCount,
        unmatchedCount,
        startedAt,
      );
    }

    const mapped = toGithubActivityRows(
      projectId,
      scope.source.id,
      pageResult.commits,
      memberIdsByLogin,
    );

    const persisted = await insertGithubActivityRows(supabase, mapped.rows);

    if (!persisted.ok) {
      return partialFailure(
        insertedCount > 0 || page > 1 ? "partial_failure" : "database_error",
        insertedCount,
        matchedCount,
        unmatchedCount,
        startedAt,
      );
    }

    insertedCount += pageResult.commits.length;
    matchedCount += mapped.matchedCount;
    unmatchedCount += mapped.unmatchedCount;

    if (pageResult.reachedEnd) {
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
  const sourceResult = await updateGithubSourceLastSyncedAt(
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
