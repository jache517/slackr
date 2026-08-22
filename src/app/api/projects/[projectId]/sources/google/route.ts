import { errorResponse, successResponse } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/validation";
import { requireProjectAccess } from "@/lib/auth/require-project-access";
import { requireUser } from "@/lib/auth/require-user";
import { buildGoogleAuthorizationUrl } from "@/lib/integrations/google/oauth";
import { createGoogleOAuthIntent } from "@/lib/integrations/google/connection-intent";
import { getGoogleOAuthConfig } from "@/lib/env.server";
import { getExistingSource } from "@/lib/sources/source-repository";
import {
  canonicalizeGoogleDocumentUrl,
  connectGoogleDocsSourceSchema,
} from "@/lib/sources/source-validation";
import { validateProjectId } from "@/lib/projects/project-validation";

type GoogleSourceRouteContext = {
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
  context: GoogleSourceRouteContext,
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

    const body = await parseJsonBody(request, connectGoogleDocsSourceSchema);

    if (!body.ok) return body.response;

    const reference = canonicalizeGoogleDocumentUrl(body.data.documentUrl);

    if (!reference) return internalErrorResponse();

    const existing = await getExistingSource(auth.supabase, projectId, "googleDocs");

    if (!existing.ok) return internalErrorResponse();

    if (existing.source) {
      return conflictResponse(
        existing.source.externalId === reference.documentId
          ? "source_already_connected"
          : "source_type_already_connected",
      );
    }

    let config: ReturnType<typeof getGoogleOAuthConfig>;

    try {
      config = getGoogleOAuthConfig();
    } catch {
      return errorResponse(
        "GOOGLE_OAUTH_NOT_CONFIGURED",
        "Google OAuth is not configured",
        503,
      );
    }

    const intent = await createGoogleOAuthIntent(
      auth.supabase,
      projectId,
      reference.documentId,
    );

    if (!intent.ok) {
      return intent.reason === "source_already_connected" ||
        intent.reason === "source_type_already_connected"
        ? conflictResponse(intent.reason)
        : errorResponse(
            "GOOGLE_OAUTH_TEMPORARILY_UNAVAILABLE",
            "Google OAuth is temporarily unavailable",
            503,
          );
    }

    return successResponse({
      authorizationUrl: buildGoogleAuthorizationUrl({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        state: intent.state,
      }),
    });
  } catch {
    return internalErrorResponse();
  }
}
