import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireMemberAccess } from "@/lib/auth/require-member-access";
import { requireUser } from "@/lib/auth/require-user";
import { upsertMemberRoleContextRow } from "@/lib/activity/activity-repository";
import { mapMemberRoleContext } from "@/lib/projects/project-mapper";
import { validateMemberId } from "@/lib/members/member-validation";
import {
  updateMemberRoleContextSchema,
} from "@/lib/context/context-validation";

type MemberRoleContextRouteContext = {
  params: Promise<{ memberId: string }>;
};

function invalidMemberIdResponse() {
  return errorResponse(
    "VALIDATION_ERROR",
    "Member ID is invalid",
    400,
    { memberId: "Member ID must be a valid UUID" },
  );
}

function memberNotFoundResponse() {
  return errorResponse("MEMBER_NOT_FOUND", "Member not found", 404);
}

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

export async function PUT(request: Request, context: MemberRoleContextRouteContext) {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    const { memberId } = await context.params;

    if (!validateMemberId(memberId).success) {
      return invalidMemberIdResponse();
    }

    const access = await requireMemberAccess(
      auth.supabase,
      auth.user,
      memberId,
    );

    if (!access.ok) {
      return access.reason === "not_found"
        ? memberNotFoundResponse()
        : internalErrorResponse();
    }

    const body = await parseJsonBody(request, updateMemberRoleContextSchema);

    if (!body.ok) {
      return body.response;
    }

    const result = await upsertMemberRoleContextRow(auth.supabase, {
      project_id: access.member.projectId,
      member_id: memberId,
      primary_role: body.data.primaryRole,
      additional_roles: body.data.additionalRoles,
      responsibilities: body.data.responsibilities,
      additional_context: body.data.additionalContext,
      submission_type: "project_owner_recorded",
      submitted_by_user_id: auth.user.id,
    });

    if (!result.ok) {
      return internalErrorResponse();
    }

    return successResponse(mapMemberRoleContext(result.roleContext));
  } catch {
    return internalErrorResponse();
  }
}
