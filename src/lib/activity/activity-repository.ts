import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapMemberRoleContext,
  mapSourceConnection,
  type MemberRoleContextRow,
  type MemberRow,
  type ProjectRow,
  type SourceConnectionRow,
} from "@/lib/projects/project-mapper";
import type { Database } from "@/types/database";

const PROJECT_COLUMNS =
  "id, title, deadline, description, created_by, created_at, updated_at";
const SOURCE_CONNECTION_COLUMNS =
  "id, project_id, source_type, external_id, display_name, connected_at, last_synced_at, sync_error_code, sync_error_message, sync_error_at";
const MEMBER_COLUMNS =
  "id, project_id, name, email, github_username, google_email";
const GITHUB_ACTIVITY_COLUMNS =
  "id, project_id, member_id, commit_sha, commit_message, author_username, authored_at";
const GOOGLE_DOCS_ACTIVITY_COLUMNS =
  "id, project_id, member_id, activity_type, provider_activity_id, occurred_at";
const MEMBER_CONTEXT_COLUMNS =
  "id, project_id, member_id, context_text, submitted_by_user_id, submission_type, created_at";
const MEMBER_ROLE_CONTEXT_COLUMNS =
  "id, project_id, member_id, primary_role, additional_roles, responsibilities, additional_context, submission_type, submitted_by_user_id, created_at, updated_at";

export type ActivityProjectRow = Pick<
  ProjectRow,
  | "id"
  | "title"
  | "deadline"
  | "description"
  | "created_by"
  | "created_at"
  | "updated_at"
>;

export type ActivityMemberRow = Pick<
  MemberRow,
  "id" | "project_id" | "name" | "github_username" | "google_email"
>;

export type ActivityGithubRow = Pick<
  Database["public"]["Tables"]["github_activity"]["Row"],
  | "id"
  | "project_id"
  | "member_id"
  | "commit_sha"
  | "commit_message"
  | "author_username"
  | "authored_at"
>;

export type ActivityDocsRow = Pick<
  Database["public"]["Tables"]["docs_activity"]["Row"],
  | "id"
  | "project_id"
  | "member_id"
  | "activity_type"
  | "provider_activity_id"
  | "occurred_at"
>;

export type ActivityMemberContextRow = Pick<
  Database["public"]["Tables"]["member_context"]["Row"],
  | "id"
  | "project_id"
  | "member_id"
  | "context_text"
  | "submitted_by_user_id"
  | "submission_type"
  | "created_at"
>;

export type ActivityMemberRoleContextRow = MemberRoleContextRow;

export type ActivitySourceConnectionRow = Omit<
  SourceConnectionRow,
  "source_type"
> & {
  source_type: "github" | "google_docs";
};

export type ActivitySourceRow = SourceConnectionRow;

export type ActivityScope =
  | {
      ok: true;
      project: ActivityProjectRow;
      sourceConnections: ActivitySourceConnectionRow[];
      members: ActivityMemberRow[];
      githubActivity: ActivityGithubRow[];
      docsActivity: ActivityDocsRow[];
      memberContexts: ActivityMemberContextRow[];
      memberRoleContexts: ActivityMemberRoleContextRow[];
    }
  | { ok: false; reason: "database_error" | "not_found" };

export type ActivityScopeSuccess = Extract<ActivityScope, { ok: true }>;

export async function getActivityScope(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<ActivityScope> {
  const [projectResult, sourceResult, membersResult, githubResult, docsResult, contextResult, roleResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("id", projectId)
        .maybeSingle()
        .overrideTypes<ActivityProjectRow | null, { merge: false }>(),
      supabase
        .from("source_connections")
        .select(SOURCE_CONNECTION_COLUMNS)
        .eq("project_id", projectId)
        .in("source_type", ["github", "google_docs"])
        .overrideTypes<ActivitySourceConnectionRow[], { merge: false }>(),
      supabase
        .from("members")
        .select(MEMBER_COLUMNS)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .overrideTypes<ActivityMemberRow[], { merge: false }>(),
      supabase
        .from("github_activity")
        .select(GITHUB_ACTIVITY_COLUMNS)
        .eq("project_id", projectId)
        .overrideTypes<ActivityGithubRow[], { merge: false }>(),
      supabase
        .from("docs_activity")
        .select(GOOGLE_DOCS_ACTIVITY_COLUMNS)
        .eq("project_id", projectId)
        .overrideTypes<ActivityDocsRow[], { merge: false }>(),
      supabase
        .from("member_context")
        .select(MEMBER_CONTEXT_COLUMNS)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .overrideTypes<ActivityMemberContextRow[], { merge: false }>(),
      supabase
        .from("member_role_context")
        .select(MEMBER_ROLE_CONTEXT_COLUMNS)
        .eq("project_id", projectId)
        .overrideTypes<ActivityMemberRoleContextRow[], { merge: false }>(),
    ]);

  if (
    projectResult.error ||
    sourceResult.error ||
    membersResult.error ||
    githubResult.error ||
    docsResult.error ||
    contextResult.error ||
    roleResult.error
  ) {
    return { ok: false, reason: "database_error" };
  }

  if (!projectResult.data) {
    return { ok: false, reason: "not_found" };
  }

  return {
    ok: true,
    project: projectResult.data,
    sourceConnections: sourceResult.data ?? [],
    members: membersResult.data ?? [],
    githubActivity: githubResult.data ?? [],
    docsActivity: docsResult.data ?? [],
    memberContexts: contextResult.data ?? [],
    memberRoleContexts: roleResult.data ?? [],
  };
}

export async function getMemberContexts(
  supabase: SupabaseClient<Database>,
  projectId: string,
  memberId?: string,
): Promise<{ ok: true; contexts: ActivityMemberContextRow[] } | { ok: false; reason: "database_error" | "not_found" }> {
  let query = supabase
    .from("member_context")
    .select(MEMBER_CONTEXT_COLUMNS)
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query.overrideTypes<
    ActivityMemberContextRow[],
    { merge: false }
  >();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true, contexts: data ?? [] };
}

export async function insertMemberContextRow(
  supabase: SupabaseClient<Database>,
  input: Database["public"]["Tables"]["member_context"]["Insert"],
): Promise<{ ok: true; context: ActivityMemberContextRow } | { ok: false; reason: "database_error" }> {
  const { data, error } = await supabase
    .from("member_context")
    .insert(input)
    .select(MEMBER_CONTEXT_COLUMNS)
    .single()
    .overrideTypes<ActivityMemberContextRow, { merge: false }>();

  if (error || !data) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true, context: data };
}

export async function upsertMemberRoleContextRow(
  supabase: SupabaseClient<Database>,
  input: Database["public"]["Tables"]["member_role_context"]["Insert"],
): Promise<{ ok: true; roleContext: ActivityMemberRoleContextRow } | { ok: false; reason: "database_error" }> {
  const { data, error } = await supabase
    .from("member_role_context")
    .upsert(input, { onConflict: "member_id" })
    .select(MEMBER_ROLE_CONTEXT_COLUMNS)
    .single()
    .overrideTypes<ActivityMemberRoleContextRow, { merge: false }>();

  if (error || !data) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true, roleContext: data };
}

export function mapActivitySourceConnection(row: SourceConnectionRow) {
  return mapSourceConnection(row);
}

export function mapActivityMemberRoleContext(row: MemberRoleContextRow) {
  return mapMemberRoleContext(row);
}
