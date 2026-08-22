import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapSourceConnection,
  type SourceConnectionRow,
} from "@/lib/projects/project-mapper";
import type { SourceConnection, SourceType } from "@/types/api";
import type { Database } from "@/types/database";

const SOURCE_CONNECTION_COLUMNS =
  "id, project_id, source_type, external_id, display_name, connected_at, last_synced_at, sync_error_code, sync_error_message, sync_error_at";

type SourceRepositoryFailure = { ok: false; reason: "database_error" };

export type SourceConflictReason =
  | "source_already_connected"
  | "source_type_already_connected";

type ExistingSourceResult =
  | { ok: true; source: SourceConnection | null }
  | SourceRepositoryFailure;

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

export async function getExistingSource(
  supabase: SupabaseClient<Database>,
  projectId: string,
  sourceType: SourceType,
): Promise<ExistingSourceResult> {
  const databaseSourceType = sourceType === "googleDocs" ? "google_docs" : "github";
  const { data, error } = await supabase
    .from("source_connections")
    .select(SOURCE_CONNECTION_COLUMNS)
    .eq("project_id", projectId)
    .eq("source_type", databaseSourceType)
    .maybeSingle()
    .overrideTypes<SourceConnectionRow | null, { merge: false }>();

  if (error) return { ok: false, reason: "database_error" };

  return { ok: true, source: data ? mapSourceConnection(data) : null };
}

function conflictForExistingSource(
  source: SourceConnection,
  externalId: string,
): SourceConflictReason {
  return source.externalId === externalId
    ? "source_already_connected"
    : "source_type_already_connected";
}

export async function insertSourceConnection(
  supabase: SupabaseClient<Database>,
  input: {
    projectId: string;
    sourceType: SourceType;
    externalId: string;
    displayName: string;
  },
): Promise<
  | { ok: true; source: SourceConnection }
  | { ok: false; reason: SourceConflictReason | "database_error" }
> {
  const databaseSourceType = input.sourceType === "googleDocs" ? "google_docs" : "github";
  const existing = await getExistingSource(
    supabase,
    input.projectId,
    input.sourceType,
  );

  if (!existing.ok) return existing;
  if (existing.source) {
    return {
      ok: false,
      reason: conflictForExistingSource(existing.source, input.externalId),
    };
  }

  const { data, error } = await supabase
    .from("source_connections")
    .insert({
      project_id: input.projectId,
      source_type: databaseSourceType,
      external_id: input.externalId,
      display_name: input.displayName,
      last_synced_at: null,
    })
    .select(SOURCE_CONNECTION_COLUMNS)
    .single()
    .overrideTypes<SourceConnectionRow, { merge: false }>();

  if (!error && data) return { ok: true, source: mapSourceConnection(data) };

  if (!isUniqueViolation(error)) return { ok: false, reason: "database_error" };

  const afterRace = await getExistingSource(
    supabase,
    input.projectId,
    input.sourceType,
  );

  if (!afterRace.ok || !afterRace.source) {
    return { ok: false, reason: "database_error" };
  }

  return {
    ok: false,
    reason: conflictForExistingSource(afterRace.source, input.externalId),
  };
}
