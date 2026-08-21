import {
  errorResponse,
  noContentResponse,
  successResponse,
} from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireMemberAccess } from "@/lib/auth/require-member-access";
import { requireUser } from "@/lib/auth/require-user";
import {
  deleteMember,
  updateMember,
} from "@/lib/members/member-repository";
import {
  updateMemberSchema,
  validateMemberId,
} from "@/lib/members/member-validation";

type MemberRouteContext = {
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

function identityConflictResponse(fields: Record<string, string>) {
  return errorResponse(
    "MEMBER_IDENTITY_CONFLICT",
    "One or more identities are already assigned in this project",
    409,
    fields,
  );
}

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

export async function PATCH(request: Request, context: MemberRouteContext) {
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

    const body = await parseJsonBody(request, updateMemberSchema);

    if (!body.ok) {
      return body.response;
    }

    const result = await updateMember(
      auth.supabase,
      access.member.projectId,
      access.member.id,
      body.data,
    );

    if (!result.ok) {
      if (result.reason === "identity_conflict") {
        return identityConflictResponse(result.fields);
      }

      return result.reason === "not_found"
        ? memberNotFoundResponse()
        : internalErrorResponse();
    }

    return successResponse(result.member);
  } catch {
    return internalErrorResponse();
  }
}

export async function DELETE(_request: Request, context: MemberRouteContext) {
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

    const result = await deleteMember(
      auth.supabase,
      access.member.projectId,
      access.member.id,
    );

    if (!result.ok) {
      return result.reason === "not_found"
        ? memberNotFoundResponse()
        : internalErrorResponse();
    }

    return noContentResponse();
  } catch {
    return internalErrorResponse();
  }
}
