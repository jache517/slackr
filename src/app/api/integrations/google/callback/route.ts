import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/require-user";
import {
  consumeGoogleOAuthIntent,
  inspectGoogleOAuthIntent,
} from "@/lib/integrations/google/connection-intent";
import {
  exchangeGoogleAuthorizationCode,
  fetchGoogleDocumentMetadata,
  fetchGoogleUserInfo,
} from "@/lib/integrations/google/document-client";
import { updateGoogleDocsSourceSyncFailure } from "@/lib/integrations/google/google-docs-activity-repository";
import { syncGoogleDocsActivityForProject } from "@/lib/integrations/google/google-docs-activity-service";
import { getGoogleOAuthConfig } from "@/lib/env.server";
import { insertSourceConnection } from "@/lib/sources/source-repository";

const SOURCES_PATH = "/sources";

type CallbackErrorCode =
  | "UNAUTHENTICATED"
  | "GOOGLE_OAUTH_NOT_CONFIGURED"
  | "GOOGLE_OAUTH_TEMPORARILY_UNAVAILABLE"
  | "GOOGLE_OAUTH_STATE_INVALID"
  | "GOOGLE_OAUTH_STATE_EXPIRED"
  | "GOOGLE_OAUTH_CALLBACK_REPLAYED"
  | "GOOGLE_DOCUMENT_NOT_ACCESSIBLE"
  | "GOOGLE_PROVIDER_ERROR"
  | "GOOGLE_RATE_LIMITED"
  | "GOOGLE_PARTIAL_SYNC_FAILURE"
  | "SOURCE_ALREADY_CONNECTED"
  | "SOURCE_TYPE_ALREADY_CONNECTED"
  | "INTERNAL_ERROR";

function redirectToSources(
  request: NextRequest,
  projectId?: string,
  errorCode?: CallbackErrorCode,
) {
  const url = new URL(
    projectId ? `/projects/${projectId}${SOURCES_PATH}` : "/projects",
    request.url,
  );

  if (errorCode) {
    url.searchParams.set("googleCallbackError", errorCode);
  }

  return NextResponse.redirect(url, 302);
}

function providerErrorCode(reason: string): CallbackErrorCode {
  if (reason === "rate_limited") return "GOOGLE_RATE_LIMITED";
  if (reason === "document_not_accessible") {
    return "GOOGLE_DOCUMENT_NOT_ACCESSIBLE";
  }
  return "GOOGLE_PROVIDER_ERROR";
}

function syncErrorCode(reason: string): CallbackErrorCode {
  if (reason === "rate_limited") return "GOOGLE_RATE_LIMITED";
  if (reason === "partial_failure") return "GOOGLE_PARTIAL_SYNC_FAILURE";
  if (
    reason === "provider_error" ||
    reason === "malformed_payload" ||
    reason === "document_not_accessible"
  ) {
    if (reason === "document_not_accessible") {
      return "GOOGLE_DOCUMENT_NOT_ACCESSIBLE";
    }
    return "GOOGLE_PROVIDER_ERROR";
  }
  return "INTERNAL_ERROR";
}

async function handleGet(request: NextRequest) {
  const auth = await requireUser();

  if (!auth.ok) return redirectToSources(request, undefined, "UNAUTHENTICATED");

  const params = request.nextUrl.searchParams;
  const state = params.get("state")?.trim() ?? "";
  const code = params.get("code")?.trim() ?? "";
  const providerError = params.get("error")?.trim() ?? "";

  if (!state) {
    return redirectToSources(request, undefined, "GOOGLE_OAUTH_STATE_INVALID");
  }

  const inspected = await inspectGoogleOAuthIntent(auth.supabase, state);

  if (!inspected.ok) {
    return redirectToSources(
      request,
      undefined,
      inspected.reason === "database_error"
        ? "GOOGLE_OAUTH_TEMPORARILY_UNAVAILABLE"
        : "GOOGLE_OAUTH_STATE_INVALID",
    );
  }

  const projectId = inspected.intent.projectId;
  const expiresAt = Date.parse(inspected.intent.expiresAt);

  if (inspected.intent.consumedAt) {
    return redirectToSources(
      request,
      projectId,
      "GOOGLE_OAUTH_CALLBACK_REPLAYED",
    );
  }

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return redirectToSources(request, projectId, "GOOGLE_OAUTH_STATE_EXPIRED");
  }

  const consumed = await consumeGoogleOAuthIntent(auth.supabase, state);

  if (!consumed.ok) {
    return redirectToSources(
      request,
      projectId,
      consumed.reason === "database_error"
        ? "GOOGLE_OAUTH_TEMPORARILY_UNAVAILABLE"
        : "GOOGLE_OAUTH_CALLBACK_REPLAYED",
    );
  }

  if (providerError || !code) {
    return redirectToSources(request, projectId, "GOOGLE_PROVIDER_ERROR");
  }

  let config: ReturnType<typeof getGoogleOAuthConfig>;

  try {
    config = getGoogleOAuthConfig();
  } catch {
    return redirectToSources(request, projectId, "GOOGLE_OAUTH_NOT_CONFIGURED");
  }

  const token = await exchangeGoogleAuthorizationCode({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
    code,
  });

  if (!token.ok) {
    return redirectToSources(request, projectId, providerErrorCode(token.reason));
  }

  const userInfo = await fetchGoogleUserInfo(token.accessToken);

  if (!userInfo.ok) {
    return redirectToSources(
      request,
      projectId,
      providerErrorCode(userInfo.reason),
    );
  }

  const document = await fetchGoogleDocumentMetadata({
    accessToken: token.accessToken,
    documentId: consumed.intent.externalId,
  });

  if (!document.ok) {
    return redirectToSources(
      request,
      projectId,
      providerErrorCode(document.reason),
    );
  }

  const source = await insertSourceConnection(auth.supabase, {
    projectId,
    sourceType: "googleDocs",
    externalId: document.id,
    displayName: document.title,
  });

  if (!source.ok) {
    return redirectToSources(
      request,
      projectId,
      source.reason === "source_already_connected"
        ? "SOURCE_ALREADY_CONNECTED"
        : source.reason === "source_type_already_connected"
          ? "SOURCE_TYPE_ALREADY_CONNECTED"
          : "INTERNAL_ERROR",
    );
  }

  const sync = await syncGoogleDocsActivityForProject(
    auth.supabase,
    projectId,
    token.accessToken,
    document.id,
  );

  if (!sync.ok) {
    const failureCode = syncErrorCode(sync.reason);
    const failureState = await updateGoogleDocsSourceSyncFailure(
      auth.supabase,
      source.source.id,
      failureCode,
      "The initial Google Docs activity sync did not complete",
    );

    return redirectToSources(
      request,
      projectId,
      failureState.ok ? failureCode : "INTERNAL_ERROR",
    );
  }

  return redirectToSources(request, projectId);
}

export async function GET(request: NextRequest) {
  try {
    return await handleGet(request);
  } catch {
    return redirectToSources(request, undefined, "INTERNAL_ERROR");
  }
}
