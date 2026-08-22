import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapMember,
  mapMemberRoleContext,
  mapProject,
  mapProjectWithCounts,
  mapSourceConnection,
  type MemberRoleContextRow,
  type MemberRow,
  type ProjectRow,
  type ProjectWithCountsRow,
  type SourceConnectionRow,
} from "@/lib/projects/project-mapper";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/projects/project-validation";
import type { Project, ProjectDetail } from "@/types/api";
import type { Database } from "@/types/database";

const PROJECT_COLUMNS =
  "id, title, deadline, description, created_by, created_at, updated_at";
const PROJECT_WITH_COUNTS_COLUMNS = `${PROJECT_COLUMNS}, members(count), source_connections(count)`;
const MEMBER_COLUMNS =
  "id, project_id, name, email, github_username, google_email, auth_user_id, created_at, updated_at";
const MEMBER_ROLE_CONTEXT_COLUMNS =
  "id, project_id, member_id, primary_role, additional_roles, responsibilities, additional_context, submission_type, submitted_by_user_id, created_at, updated_at";
const SOURCE_CONNECTION_COLUMNS =
  "id, project_id, source_type, external_id, display_name, connected_at, last_synced_at, sync_error_code, sync_error_message, sync_error_at";

type RepositoryFailure = { ok: false; reason: "database_error" };
type RepositoryNotFound = { ok: false; reason: "not_found" };

function toProjectInsert(input: CreateProjectInput, userId: string) {
  return {
    title: input.title,
    deadline: input.deadline,
    description: input.description ?? null,
    created_by: userId,
  } satisfies Database["public"]["Tables"]["projects"]["Insert"];
}

function toProjectUpdate(input: UpdateProjectInput) {
  const update: Database["public"]["Tables"]["projects"]["Update"] = {};

  if (input.title !== undefined) update.title = input.title;
  if (input.deadline !== undefined) update.deadline = input.deadline;
  if (input.description !== undefined) update.description = input.description;

  return update;
}

export async function createProject(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateProjectInput,
): Promise<{ ok: true; project: Project } | RepositoryFailure> {
  const { data, error } = await supabase
    .from("projects")
    .insert(toProjectInsert(input, userId))
    .select(PROJECT_COLUMNS)
    .single()
    .overrideTypes<ProjectRow, { merge: false }>();

  if (error || !data) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true, project: mapProject(data, 0, 0) };
}

export async function listProjects(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ ok: true; projects: Project[] } | RepositoryFailure> {
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_WITH_COUNTS_COLUMNS)
    .eq("created_by", userId)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true })
    .overrideTypes<ProjectWithCountsRow[], { merge: false }>();

  if (error || !data) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true, projects: data.map(mapProjectWithCounts) };
}

export async function getProjectDetail(
  supabase: SupabaseClient<Database>,
  userId: string,
  projectId: string,
): Promise<
  | { ok: true; detail: ProjectDetail }
  | RepositoryFailure
  | RepositoryNotFound
> {
  const [projectResult, membersResult, roleContextsResult, sourcesResult] =
    await Promise.all([
      supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("id", projectId)
        .eq("created_by", userId)
        .maybeSingle()
        .overrideTypes<ProjectRow | null, { merge: false }>(),
      supabase
        .from("members")
        .select(MEMBER_COLUMNS)
        .eq("project_id", projectId)
        .order("created_at", { ascending: true })
        .order("id", { ascending: true })
        .overrideTypes<MemberRow[], { merge: false }>(),
      supabase
        .from("member_role_context")
        .select(MEMBER_ROLE_CONTEXT_COLUMNS)
        .eq("project_id", projectId)
        .overrideTypes<MemberRoleContextRow[], { merge: false }>(),
      supabase
        .from("source_connections")
        .select(SOURCE_CONNECTION_COLUMNS)
        .eq("project_id", projectId)
        .order("connected_at", { ascending: true })
        .order("id", { ascending: true })
        .overrideTypes<SourceConnectionRow[], { merge: false }>(),
    ]);

  if (
    projectResult.error ||
    membersResult.error ||
    roleContextsResult.error ||
    sourcesResult.error ||
    !membersResult.data ||
    !roleContextsResult.data ||
    !sourcesResult.data
  ) {
    return { ok: false, reason: "database_error" };
  }

  if (!projectResult.data) {
    return { ok: false, reason: "not_found" };
  }

  const roleContextByMemberId = new Map(
    roleContextsResult.data.map((row) => [
      row.member_id,
      mapMemberRoleContext(row),
    ]),
  );
  const members = membersResult.data.map((row) =>
    mapMember(row, roleContextByMemberId.get(row.id) ?? null),
  );
  const sourceConnections = sourcesResult.data.map(mapSourceConnection);

  return {
    ok: true,
    detail: {
      project: mapProject(
        projectResult.data,
        members.length,
        sourceConnections.length,
      ),
      members,
      sourceConnections,
    },
  };
}

export async function updateProject(
  supabase: SupabaseClient<Database>,
  userId: string,
  projectId: string,
  input: UpdateProjectInput,
): Promise<
  | { ok: true; project: Project }
  | RepositoryFailure
  | RepositoryNotFound
> {
  const { data, error } = await supabase
    .from("projects")
    .update(toProjectUpdate(input))
    .eq("id", projectId)
    .eq("created_by", userId)
    .select(PROJECT_WITH_COUNTS_COLUMNS)
    .maybeSingle()
    .overrideTypes<ProjectWithCountsRow | null, { merge: false }>();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, project: mapProjectWithCounts(data) };
}
