import "server-only";

import type {
  Member,
  MemberRoleContext,
  Project,
  SourceConnection,
} from "@/types/api";
import type { Database } from "@/types/database";

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
export type MemberRow = Database["public"]["Tables"]["members"]["Row"];
export type MemberRoleContextRow =
  Database["public"]["Tables"]["member_role_context"]["Row"];
export type SourceConnectionRow =
  Database["public"]["Tables"]["source_connections"]["Row"];

export type ProjectWithCountsRow = ProjectRow & {
  members: Array<{ count: number }>;
  source_connections: Array<{ count: number }>;
};

function relationCount(rows: Array<{ count: number }>) {
  const count = rows[0]?.count;

  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Invalid aggregate count");
  }

  return count;
}

export function mapProject(
  row: ProjectRow,
  memberCount: number,
  connectedSourceCount: number,
): Project {
  return {
    id: row.id,
    title: row.title,
    deadline: row.deadline,
    memberCount,
    connectedSourceCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProjectWithCounts(row: ProjectWithCountsRow) {
  return mapProject(
    row,
    relationCount(row.members),
    relationCount(row.source_connections),
  );
}

function mapSubmissionType(
  submissionType: MemberRoleContextRow["submission_type"],
): MemberRoleContext["submissionType"] {
  return submissionType === "member_self_reported"
    ? "memberSelfReported"
    : "projectOwnerRecorded";
}

export function mapMemberRoleContext(
  row: MemberRoleContextRow,
): MemberRoleContext {
  return {
    memberId: row.member_id,
    primaryRole: row.primary_role,
    additionalRoles: row.additional_roles,
    responsibilities: row.responsibilities,
    additionalContext: row.additional_context,
    submissionType: mapSubmissionType(row.submission_type),
    submittedByUserId: row.submitted_by_user_id,
    updatedAt: row.updated_at,
  };
}

export function mapMember(
  row: MemberRow,
  roleContext: MemberRoleContext | null,
): Member {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    email: row.email,
    githubUsername: row.github_username,
    googleEmail: row.google_email,
    roleContext,
  };
}

export function mapSourceConnection(row: SourceConnectionRow): SourceConnection {
  return {
    id: row.id,
    projectId: row.project_id,
    sourceType: row.source_type === "google_docs" ? "googleDocs" : "github",
    externalId: row.external_id,
    displayName: row.display_name,
    connectedAt: row.connected_at,
    lastSyncedAt: row.last_synced_at,
  };
}
