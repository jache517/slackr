import { z } from "zod";

import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { validateProjectId } from "@/lib/projects/project-validation";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

const bodySchema = z.object({
  authorUsername: z.string().trim().min(1).max(100),
});

function invalidProjectIdResponse() {
  return errorResponse("VALIDATION_ERROR", "Project ID is invalid", 400, {
    projectId: "Project ID must be a valid UUID",
  });
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

/**
 * Records that a GitHub account belongs to nobody in this project.
 *
 * The decision is what closes the "matched to nobody" warning. Without it the
 * warning has no way to tell "not looked at yet" from "looked at and settled",
 * so it reappears on every load.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireUser();

    if (!auth.ok) return auth.response;

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

    const body = await parseJsonBody(request, bodySchema);

    if (!body.ok) return body.response;

    // Deciding the same account twice is the same decision, not an error.
    const { error } = await auth.supabase
      .from("unattributed_github_accounts")
      .insert({
        project_id: projectId,
        author_username: body.data.authorUsername,
        decided_by_user_id: auth.user.id,
      });

    if (error && error.code !== "23505") {
      return internalErrorResponse();
    }

    return successResponse({ authorUsername: body.data.authorUsername }, 201);
  } catch {
    return internalErrorResponse();
  }
}

/** Undoes that decision, so the account is unresolved again. */
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const auth = await requireUser();

    if (!auth.ok) return auth.response;

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

    const body = await parseJsonBody(request, bodySchema);

    if (!body.ok) return body.response;

    const { error } = await auth.supabase
      .from("unattributed_github_accounts")
      .delete()
      .eq("project_id", projectId)
      .ilike("author_username", body.data.authorUsername);

    if (error) return internalErrorResponse();

    return successResponse({ authorUsername: body.data.authorUsername });
  } catch {
    return internalErrorResponse();
  }
}
