import { errorResponse, successResponse } from "@/lib/api/response";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { syncGithubActivityForProject } from "@/lib/github/github-activity-service";
import { validateProjectId } from "@/lib/projects/project-validation";

/**
 * Collect again, now, on the reader's say-so.
 *
 * Only GitHub can be re-read on demand: it is the one source this app can
 * reach with nobody present. Docs and Meet activity needs the owner's Google
 * session, so they are left to their own connection flow rather than failing
 * quietly here.
 *
 * The sync is idempotent - already-recorded commits are not counted twice -
 * so pressing it repeatedly costs a request and changes nothing.
 */

type SyncRouteContext = {
  params: Promise<{ projectId: string }>;
};

function internalErrorResponse() {
  return errorResponse(
    "INTERNAL_ERROR",
    "The request could not be completed",
    500,
  );
}

export async function POST(request: Request, context: SyncRouteContext) {
  try {
    const auth = await requireUser();

    if (!auth.ok) return auth.response;

    const { projectId } = await context.params;

    if (!validateProjectId(projectId).success) {
      return errorResponse("VALIDATION_ERROR", "Project ID is invalid", 400, {
        projectId: "Project ID must be a valid UUID",
      });
    }

    const access = await requireProjectAccess(
      auth.supabase,
      auth.user,
      projectId,
    );

    if (!access.ok) {
      return access.reason === "not_found"
        ? errorResponse("PROJECT_NOT_FOUND", "Project not found", 404)
        : internalErrorResponse();
    }

    const result = await syncGithubActivityForProject(auth.supabase, projectId);

    if (!result.ok) {
      if (result.reason === "source_not_connected") {
        return errorResponse(
          "SOURCE_NOT_CONNECTED",
          "No GitHub repository is connected to this project",
          404,
        );
      }

      if (result.reason === "rate_limited") {
        return errorResponse(
          "GITHUB_RATE_LIMITED",
          "GitHub temporarily limited this sync. Try again shortly.",
          429,
        );
      }

      if (result.reason === "database_error") {
        return internalErrorResponse();
      }

      return errorResponse(
        "GITHUB_PROVIDER_ERROR",
        "GitHub could not be read in full. Some commits may be missing.",
        502,
      );
    }

    return successResponse({
      source: result.source,
      insertedCount: result.insertedCount,
      matchedCount: result.matchedCount,
      unmatchedCount: result.unmatchedCount,
      completedAt: result.completedAt,
    });
  } catch {
    return internalErrorResponse();
  }
}
