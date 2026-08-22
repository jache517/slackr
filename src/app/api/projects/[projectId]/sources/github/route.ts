import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { verifyGithubRepository } from "@/lib/integrations/github/repository-client";
import {
  getExistingSource,
  insertSourceConnection,
} from "@/lib/sources/source-repository";
import {
  canonicalizeGithubRepositoryUrl,
  connectGithubSourceSchema,
} from "@/lib/sources/source-validation";
import { validateProjectId } from "@/lib/projects/project-validation";

type GithubSourceRouteContext = {
  params: Promise<{ projectId: string }>;
};

function projectNotFoundResponse() {
  return errorResponse("PROJECT_NOT_FOUND", "Project not found", 404);
}

function invalidProjectIdResponse() {
  return errorResponse(
    "VALIDATION_ERROR",
    "Project ID is invalid",
    400,
    { projectId: "Project ID must be a valid UUID" },
  );
}

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

function conflictResponse(reason: "source_already_connected" | "source_type_already_connected") {
  return reason === "source_already_connected"
    ? errorResponse(
        "SOURCE_ALREADY_CONNECTED",
        "This source is already connected to the project",
        409,
      )
    : errorResponse(
        "SOURCE_TYPE_ALREADY_CONNECTED",
        "A source of this type is already connected to the project",
        409,
      );
}

export async function POST(
  request: Request,
  context: GithubSourceRouteContext,
) {
  try {
    const auth = await requireUser();

    if (!auth.ok) return auth.response;

    const { projectId } = await context.params;

    if (!validateProjectId(projectId).success) {
      return invalidProjectIdResponse();
    }

    const access = await requireProjectAccess(auth.supabase, auth.user, projectId);

    if (!access.ok) {
      return access.reason === "not_found"
        ? projectNotFoundResponse()
        : internalErrorResponse();
    }

    const body = await parseJsonBody(request, connectGithubSourceSchema);

    if (!body.ok) return body.response;

    const reference = canonicalizeGithubRepositoryUrl(body.data.repositoryUrl);

    if (!reference) return internalErrorResponse();

    const existing = await getExistingSource(auth.supabase, projectId, "github");

    if (!existing.ok) return internalErrorResponse();

    if (existing.source) {
      return conflictResponse(
        existing.source.externalId === reference.externalId
          ? "source_already_connected"
          : "source_type_already_connected",
      );
    }

    const verification = await verifyGithubRepository(reference);

    if (!verification.ok) {
      if (verification.reason === "not_accessible") {
        return errorResponse(
          "GITHUB_REPOSITORY_NOT_ACCESSIBLE",
          "The GitHub repository is not publicly accessible",
          404,
        );
      }

      if (verification.reason === "rate_limited") {
        return errorResponse(
          "GITHUB_RATE_LIMITED",
          "GitHub temporarily limited repository verification",
          429,
        );
      }

      return errorResponse(
        "GITHUB_PROVIDER_ERROR",
        "GitHub repository verification failed",
        502,
      );
    }

    const result = await insertSourceConnection(auth.supabase, {
      projectId,
      sourceType: "github",
      externalId: verification.externalId,
      displayName: verification.displayName,
    });

    if (!result.ok) {
      return result.reason === "source_already_connected" ||
        result.reason === "source_type_already_connected"
        ? conflictResponse(result.reason)
        : internalErrorResponse();
    }

    return successResponse(result.source, 201);
  } catch {
    return internalErrorResponse();
  }
}
