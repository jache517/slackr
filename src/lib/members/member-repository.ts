import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  mapMember,
  mapMemberRoleContext,
  type MemberRoleContextRow,
  type MemberRow,
} from "@/lib/projects/project-mapper";
import type {
  CreateMemberInput,
  UpdateMemberInput,
} from "@/lib/members/member-validation";
import type { Member } from "@/types/api";
import type { Database } from "@/types/database";

const MEMBER_COLUMNS =
  "id, project_id, name, email, github_username, google_email, auth_user_id, created_at, updated_at";
const MEMBER_ROLE_CONTEXT_COLUMNS =
  "id, project_id, member_id, primary_role, additional_roles, responsibilities, additional_context, submission_type, submitted_by_user_id, created_at, updated_at";
const MEMBER_IDENTITY_COLUMNS =
  "id, email, github_username, google_email";
const IDENTITY_CONFLICT_MESSAGE =
  "Already assigned to another member in this project";

type IdentityField = "email" | "githubUsername" | "googleEmail";
type IdentityConflictFields = Partial<Record<IdentityField, string>>;

type MemberIdentityRow = Pick<
  MemberRow,
  "id" | "email" | "github_username" | "google_email"
>;

type RepositoryFailure = { ok: false; reason: "database_error" };
type RepositoryNotFound = { ok: false; reason: "not_found" };
type RepositoryConflict = {
  ok: false;
  reason: "identity_conflict";
  fields: IdentityConflictFields;
};

type SupabaseErrorLike = {
  code?: string;
  details?: string;
  message?: string;
};

const IDENTITY_CONSTRAINT_FIELDS = {
  members_project_email_unique: "email",
  members_project_github_username_unique: "githubUsername",
  members_project_google_email_unique: "googleEmail",
} as const satisfies Record<string, IdentityField>;

function normalizeStoredIdentity(value: string | null) {
  return value?.trim().toLowerCase() ?? null;
}

function conflictFieldsFromUniqueViolation(
  error: SupabaseErrorLike | null,
): IdentityConflictFields | null {
  if (!error || error.code !== "23505") {
    return null;
  }

  const safeSearchText = `${error.message ?? ""} ${error.details ?? ""}`;
  const fields: IdentityConflictFields = {};

  for (const [constraint, field] of Object.entries(
    IDENTITY_CONSTRAINT_FIELDS,
  )) {
    if (safeSearchText.includes(constraint)) {
      fields[field] = IDENTITY_CONFLICT_MESSAGE;
    }
  }

  return Object.keys(fields).length > 0 ? fields : null;
}

async function findIdentityConflicts(
  supabase: SupabaseClient<Database>,
  projectId: string,
  input: Pick<
    CreateMemberInput,
    "email" | "githubUsername" | "googleEmail"
  >,
  excludeMemberId?: string,
): Promise<
  { ok: true; fields: IdentityConflictFields } | RepositoryFailure
> {
  const { data, error } = await supabase
    .from("members")
    .select(MEMBER_IDENTITY_COLUMNS)
    .eq("project_id", projectId)
    .overrideTypes<MemberIdentityRow[], { merge: false }>();

  if (error || !data) {
    return { ok: false, reason: "database_error" };
  }

  const fields: IdentityConflictFields = {};

  for (const row of data) {
    if (row.id === excludeMemberId) {
      continue;
    }

    if (
      input.email != null &&
      normalizeStoredIdentity(row.email) === input.email
    ) {
      fields.email = IDENTITY_CONFLICT_MESSAGE;
    }

    if (
      input.githubUsername != null &&
      normalizeStoredIdentity(row.github_username) === input.githubUsername
    ) {
      fields.githubUsername = IDENTITY_CONFLICT_MESSAGE;
    }

    if (
      input.googleEmail != null &&
      normalizeStoredIdentity(row.google_email) === input.googleEmail
    ) {
      fields.googleEmail = IDENTITY_CONFLICT_MESSAGE;
    }
  }

  return { ok: true, fields };
}

function toMemberInsert(input: CreateMemberInput, projectId: string) {
  return {
    project_id: projectId,
    name: input.name,
    email: input.email ?? null,
    github_username: input.githubUsername ?? null,
    google_email: input.googleEmail ?? null,
    auth_user_id: null,
  } satisfies Database["public"]["Tables"]["members"]["Insert"];
}

function toMemberUpdate(input: UpdateMemberInput) {
  const update: Database["public"]["Tables"]["members"]["Update"] = {};

  if (input.name !== undefined) update.name = input.name;
  if (input.email !== undefined) update.email = input.email;
  if (input.githubUsername !== undefined) {
    update.github_username = input.githubUsername;
  }
  if (input.googleEmail !== undefined) update.google_email = input.googleEmail;

  return update;
}

async function getMemberRoleContext(
  supabase: SupabaseClient<Database>,
  projectId: string,
  memberId: string,
): Promise<
  | { ok: true; roleContext: Member["roleContext"] }
  | RepositoryFailure
> {
  const { data, error } = await supabase
    .from("member_role_context")
    .select(MEMBER_ROLE_CONTEXT_COLUMNS)
    .eq("project_id", projectId)
    .eq("member_id", memberId)
    .maybeSingle()
    .overrideTypes<MemberRoleContextRow | null, { merge: false }>();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  return {
    ok: true,
    roleContext: data ? mapMemberRoleContext(data) : null,
  };
}

export async function createMember(
  supabase: SupabaseClient<Database>,
  projectId: string,
  input: CreateMemberInput,
): Promise<
  | { ok: true; member: Member }
  | RepositoryFailure
  | RepositoryConflict
> {
  const conflicts = await findIdentityConflicts(supabase, projectId, input);

  if (!conflicts.ok) {
    return conflicts;
  }

  if (Object.keys(conflicts.fields).length > 0) {
    return { ok: false, reason: "identity_conflict", fields: conflicts.fields };
  }

  const { data, error } = await supabase
    .from("members")
    .insert(toMemberInsert(input, projectId))
    .select(MEMBER_COLUMNS)
    .single()
    .overrideTypes<MemberRow, { merge: false }>();

  if (error) {
    const fields = conflictFieldsFromUniqueViolation(error);

    return fields
      ? { ok: false, reason: "identity_conflict", fields }
      : { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "database_error" };
  }

  return { ok: true, member: mapMember(data, null) };
}

export async function updateMember(
  supabase: SupabaseClient<Database>,
  projectId: string,
  memberId: string,
  input: UpdateMemberInput,
): Promise<
  | { ok: true; member: Member }
  | RepositoryFailure
  | RepositoryNotFound
  | RepositoryConflict
> {
  const [conflicts, roleContext] = await Promise.all([
    findIdentityConflicts(supabase, projectId, input, memberId),
    getMemberRoleContext(supabase, projectId, memberId),
  ]);

  if (!conflicts.ok || !roleContext.ok) {
    return { ok: false, reason: "database_error" };
  }

  if (Object.keys(conflicts.fields).length > 0) {
    return { ok: false, reason: "identity_conflict", fields: conflicts.fields };
  }

  const { data, error } = await supabase
    .from("members")
    .update(toMemberUpdate(input))
    .eq("id", memberId)
    .eq("project_id", projectId)
    .select(MEMBER_COLUMNS)
    .maybeSingle()
    .overrideTypes<MemberRow | null, { merge: false }>();

  if (error) {
    const fields = conflictFieldsFromUniqueViolation(error);

    return fields
      ? { ok: false, reason: "identity_conflict", fields }
      : { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return {
    ok: true,
    member: mapMember(data, roleContext.roleContext),
  };
}

export async function deleteMember(
  supabase: SupabaseClient<Database>,
  projectId: string,
  memberId: string,
): Promise<{ ok: true } | RepositoryFailure | RepositoryNotFound> {
  const { data, error } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId)
    .eq("project_id", projectId)
    .select("id")
    .maybeSingle()
    .overrideTypes<{ id: string } | null, { merge: false }>();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true };
}
