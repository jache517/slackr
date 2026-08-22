import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { createMember } from "@/lib/members/member-repository";
import { createMemberSchema } from "@/lib/members/member-validation";
import { validateProjectId } from "@/lib/projects/project-validation";

type ProjectMembersRouteContext = {
  params: Promise<{ projectId: string }>;
};

function invalidProjectIdResponse() {
  return errorResponse(
    "VALIDATION_ERROR",
    "Project ID is invalid",
    400,
    { projectId: "Project ID must be a valid UUID" },
  );
}

function projectNotFoundResponse() {
  return errorResponse("PROJECT_NOT_FOUND", "Project not found", 404);
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

export async function POST(
  request: Request,
  context: ProjectMembersRouteContext,
) {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    const { projectId } = await context.params;

    if (!validateProjectId(projectId).success) {
      return invalidProjectIdResponse();
    }

    const access = await requireProjectAccess(
      auth.supabase,
      auth.user,
      projectId,
    );

    if (!access.ok) {
      return access.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    const body = await parseJsonBody(request, createMemberSchema);

    if (!body.ok) {
      return body.response;
    }

    const result = await createMember(auth.supabase, projectId, body.data);

    if (!result.ok) {
      return result.reason === "identity_conflict"
        ? identityConflictResponse(result.fields)
        : internalErrorResponse();
    }

    return successResponse(result.member, 201);
  } catch {
    return internalErrorResponse();
  }
}
