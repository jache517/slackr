import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapSourceConnection,
  type MemberRow,
  type ProjectRow,
  type SourceConnectionRow,
} from "@/lib/projects/project-mapper";
import type { SourceConnection } from "@/types/api";
import type { Database } from "@/types/database";

const PROJECT_CREATED_AT_COLUMNS = "created_at";
const SOURCE_CONNECTION_COLUMNS =
  "id, project_id, source_type, external_id, display_name, connected_at, last_synced_at";
const MEMBER_GITHUB_USERNAME_COLUMNS = "id, github_username";

type RepositoryFailure = { ok: false; reason: "database_error" };
type RepositoryNotFound = { ok: false; reason: "not_found" };

export type GithubActivitySyncScope =
  | {
      ok: true;
      projectCreatedAt: string;
      source: SourceConnection;
      members: Array<Pick<MemberRow, "id" | "github_username">>;
    }
  | RepositoryFailure
  | RepositoryNotFound;

export async function getGithubActivitySyncScope(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<GithubActivitySyncScope> {
  const [projectResult, sourceResult, membersResult] = await Promise.all([
    supabase
      .from("projects")
      .select(PROJECT_CREATED_AT_COLUMNS)
      .eq("id", projectId)
      .maybeSingle()
      .overrideTypes<Pick<ProjectRow, "created_at"> | null, { merge: false }>(),
    supabase
      .from("source_connections")
      .select(SOURCE_CONNECTION_COLUMNS)
      .eq("project_id", projectId)
      .eq("source_type", "github")
      .maybeSingle()
      .overrideTypes<SourceConnectionRow | null, { merge: false }>(),
    supabase
      .from("members")
      .select(MEMBER_GITHUB_USERNAME_COLUMNS)
      .eq("project_id", projectId)
      .overrideTypes<Array<Pick<MemberRow, "id" | "github_username">>, { merge: false }>(),
  ]);

  if (projectResult.error || sourceResult.error || membersResult.error) {
    return { ok: false, reason: "database_error" };
  }

  if (!projectResult.data || !sourceResult.data) {
    return { ok: false, reason: "not_found" };
  }

  return {
    ok: true,
    projectCreatedAt: projectResult.data.created_at,
    source: mapSourceConnection(sourceResult.data),
    members: membersResult.data,
  };
}

export async function insertGithubActivityRows(
  supabase: SupabaseClient<Database>,
  rows: Database["public"]["Tables"]["github_activity"]["Insert"][],
): Promise<{ ok: true } | RepositoryFailure> {
  if (rows.length === 0) {
    return { ok: true };
  }

  const { error } = await supabase
    .from("github_activity")
    .upsert(rows, {
      onConflict: "source_connection_id,commit_sha",
    });

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true };
}

export async function updateGithubSourceLastSyncedAt(
  supabase: SupabaseClient<Database>,
  sourceConnectionId: string,
  lastSyncedAt: string,
): Promise<
  | { ok: true; source: SourceConnection }
  | RepositoryFailure
  | RepositoryNotFound
> {
  const { data, error } = await supabase
    .from("source_connections")
    .update({ last_synced_at: lastSyncedAt })
    .eq("id", sourceConnectionId)
    .eq("source_type", "github")
    .select(SOURCE_CONNECTION_COLUMNS)
    .maybeSingle()
    .overrideTypes<SourceConnectionRow | null, { merge: false }>();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, source: mapSourceConnection(data) };
}
