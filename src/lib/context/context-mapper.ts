import "server-only";

import type { MemberContext } from "@/types/api";
import type { Database } from "@/types/database";

type MemberContextRow =
  Database["public"]["Tables"]["member_context"]["Row"];

export function mapMemberContext(row: MemberContextRow): MemberContext {
  return {
    id: row.id,
    projectId: row.project_id,
    memberId: row.member_id,
    contextText: row.context_text,
    submittedByUserId: row.submitted_by_user_id,
    submissionType:
      row.submission_type === "member_self_reported"
        ? "memberSelfReported"
        : "projectOwnerRecorded",
    createdAt: row.created_at,
  };
}
