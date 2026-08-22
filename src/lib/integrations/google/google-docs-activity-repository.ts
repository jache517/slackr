import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapSourceConnection,
  type MemberRow,
  type SourceConnectionRow,
} from "@/lib/projects/project-mapper";
import type { SourceConnection } from "@/types/api";
import type { Database } from "@/types/database";

const SOURCE_CONNECTION_COLUMNS =
  "id, project_id, source_type, external_id, display_name, connected_at, last_synced_at, sync_error_code, sync_error_message, sync_error_at";
const MEMBER_GOOGLE_EMAIL_COLUMNS = "id, google_email";

type RepositoryFailure = { ok: false; reason: "database_error" };
type RepositoryNotFound = { ok: false; reason: "not_found" };

export type GoogleDocsActivitySyncScope =
  | {
      ok: true;
      source: SourceConnection;
      members: Array<Pick<MemberRow, "id" | "google_email">>;
    }
  | RepositoryFailure
  | RepositoryNotFound;

export async function getGoogleDocsActivitySyncScope(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<GoogleDocsActivitySyncScope> {
  const [sourceResult, membersResult] = await Promise.all([
    supabase
      .from("source_connections")
      .select(SOURCE_CONNECTION_COLUMNS)
      .eq("project_id", projectId)
      .eq("source_type", "google_docs")
      .maybeSingle()
      .overrideTypes<SourceConnectionRow | null, { merge: false }>(),
    supabase
      .from("members")
      .select(MEMBER_GOOGLE_EMAIL_COLUMNS)
      .eq("project_id", projectId)
      .overrideTypes<
        Array<Pick<MemberRow, "id" | "google_email">>,
        { merge: false }
      >(),
  ]);

  if (sourceResult.error || membersResult.error) {
    return { ok: false, reason: "database_error" };
  }

  if (!sourceResult.data) {
    return { ok: false, reason: "not_found" };
  }

  return {
    ok: true,
    source: mapSourceConnection(sourceResult.data),
    members: membersResult.data,
  };
}

export async function insertGoogleDocsActivityRows(
  supabase: SupabaseClient<Database>,
  rows: Database["public"]["Tables"]["docs_activity"]["Insert"][],
): Promise<{ ok: true } | RepositoryFailure> {
  if (rows.length === 0) return { ok: true };

  const { error } = await supabase.from("docs_activity").upsert(rows, {
    onConflict: "source_connection_id,provider_activity_id",
    ignoreDuplicates: true,
  });

  return error ? { ok: false, reason: "database_error" } : { ok: true };
}

export async function updateGoogleDocsSourceSyncSuccess(
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
    .update({
      last_synced_at: lastSyncedAt,
      sync_error_code: null,
      sync_error_message: null,
      sync_error_at: null,
    })
    .eq("id", sourceConnectionId)
    .eq("source_type", "google_docs")
    .select(SOURCE_CONNECTION_COLUMNS)
    .maybeSingle()
    .overrideTypes<SourceConnectionRow | null, { merge: false }>();

  if (error) return { ok: false, reason: "database_error" };
  if (!data) return { ok: false, reason: "not_found" };

  return { ok: true, source: mapSourceConnection(data) };
}

export async function updateGoogleDocsSourceSyncFailure(
  supabase: SupabaseClient<Database>,
  sourceConnectionId: string,
  errorCode: string,
  errorMessage: string,
): Promise<{ ok: true } | RepositoryFailure> {
  const { error } = await supabase
    .from("source_connections")
    .update({
      sync_error_code: errorCode,
      sync_error_message: errorMessage,
      sync_error_at: new Date().toISOString(),
    })
    .eq("id", sourceConnectionId)
    .eq("source_type", "google_docs");

  return error ? { ok: false, reason: "database_error" } : { ok: true };
}
