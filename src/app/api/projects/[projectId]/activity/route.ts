import { errorResponse, successResponse } from "@/lib/api/response";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { buildProjectActivity } from "@/lib/activity/activity-service";
import { getActivityScope } from "@/lib/activity/activity-repository";
import { validateProjectId } from "@/lib/projects/project-validation";

type ActivityRouteContext = {
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

export async function GET(_request: Request, context: ActivityRouteContext) {
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

    const scope = await getActivityScope(auth.supabase, projectId);

    if (!scope.ok) {
      return scope.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    return successResponse(buildProjectActivity(scope));
  } catch {
    return internalErrorResponse();
  }
}
