import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import {
  getProjectDetail,
  updateProject,
} from "@/lib/projects/project-repository";
import {
  updateProjectSchema,
  validateProjectId,
} from "@/lib/projects/project-validation";

type ProjectRouteContext = {
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

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

export async function GET(_request: Request, context: ProjectRouteContext) {
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

    const result = await getProjectDetail(
      auth.supabase,
      auth.user.id,
      projectId,
    );

    if (!result.ok) {
      return result.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    return successResponse(result.detail);
  } catch {
    return internalErrorResponse();
  }
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
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

    const body = await parseJsonBody(request, updateProjectSchema);

    if (!body.ok) {
      return body.response;
    }

    const result = await updateProject(
      auth.supabase,
      auth.user.id,
      projectId,
      body.data,
    );

    if (!result.ok) {
      return result.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    return successResponse(result.project);
  } catch {
    return internalErrorResponse();
  }
}
