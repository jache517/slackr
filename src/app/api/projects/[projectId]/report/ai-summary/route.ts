import { errorResponse, successResponse } from "@/lib/api/response";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { generateAiEvidenceReport } from "@/lib/report/ai-report-service";
import { getReportScope } from "@/lib/report/report-repository";
import { buildCanonicalEvidenceSnapshot } from "@/lib/report/report-service";
import { resolveReportPeriod } from "@/lib/report/report-validation";
import { validateProjectId } from "@/lib/projects/project-validation";

type AiSummaryRouteContext = {
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

async function validateEmptyRequestBody(request: Request) {
  const text = await request.text();

  if (text.trim().length === 0) {
    return true;
  }

  try {
    const body: unknown = JSON.parse(text);
    return (
      typeof body === "object" &&
      body !== null &&
      !Array.isArray(body) &&
      Object.keys(body).length === 0
    );
  } catch {
    return false;
  }
}

function aiFailureResponse(reason: Parameters<typeof mapAiFailure>[0]) {
  const mapped = mapAiFailure(reason);
  return errorResponse(mapped.code, mapped.message, mapped.status);
}

function mapAiFailure(reason: "not_configured" | "unavailable" | "rate_limited" | "invalid_output") {
  switch (reason) {
    case "not_configured":
      return {
        code: "AI_PROVIDER_NOT_CONFIGURED",
        message: "The AI report provider is not configured",
        status: 503 as const,
      };
    case "rate_limited":
      return {
        code: "AI_RATE_LIMITED",
        message: "The AI report provider is rate limited",
        status: 429 as const,
      };
    case "invalid_output":
      return {
        code: "AI_INVALID_OUTPUT",
        message: "The AI report provider returned an invalid report",
        status: 502 as const,
      };
    case "unavailable":
      return {
        code: "AI_PROVIDER_UNAVAILABLE",
        message: "The AI report provider is temporarily unavailable",
        status: 503 as const,
      };
  }
}

export async function POST(
  request: Request,
  context: AiSummaryRouteContext,
) {
  try {
    const auth = await requireUser();

    if (!auth.ok) {
      return auth.response;
    }

    if (!(await validateEmptyRequestBody(request))) {
      return errorResponse(
        "VALIDATION_ERROR",
        "The AI report request body must be empty",
        400,
      );
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

    const snapshot = buildCanonicalEvidenceSnapshot(scope, period.period);
    const result = await generateAiEvidenceReport(snapshot);

    if (!result.ok) {
      return aiFailureResponse(result.reason);
    }

    return successResponse(result.report);
  } catch {
    return internalErrorResponse();
  }
}
