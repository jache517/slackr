import { errorResponse, successResponse } from "@/lib/api/response";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { getReportScope } from "@/lib/report/report-repository";
import { buildCanonicalEvidenceSnapshot } from "@/lib/report/report-service";
import { resolveReportPeriod } from "@/lib/report/report-validation";
import { validateProjectId } from "@/lib/projects/project-validation";

type ReportRouteContext = {
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

export async function GET(request: Request, context: ReportRouteContext) {
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

    const scope = await getReportScope(auth.supabase, projectId);

    if (!scope.ok) {
      return scope.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    const period = resolveReportPeriod(
      new URL(request.url).searchParams,
      scope.project.created_at,
      scope.project.deadline,
    );

    if (!period.ok) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Report monitoring period is invalid",
        400,
        period.fields,
      );
    }

    return successResponse(
      buildCanonicalEvidenceSnapshot(scope, period.period),
    );
  } catch {
    return internalErrorResponse();
  }
}
