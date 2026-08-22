import "server-only";

import { z } from "zod";

import type { DocsActivityType } from "@/types/database";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";
const GOOGLE_DRIVE_FILES_ENDPOINT = "https://www.googleapis.com/drive/v3/files";
const GOOGLE_DRIVE_ACTIVITY_ENDPOINT =
  "https://driveactivity.googleapis.com/v2/activity:query";
const GOOGLE_API_TIMEOUT_MS = 10_000;

const tokenResponseSchema = z.object({
  access_token: z.string().trim().min(1),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().trim().min(1).optional(),
  scope: z.string().trim().min(1).optional(),
  token_type: z.string().trim().min(1).optional(),
  id_token: z.string().trim().min(1).optional(),
});

const userInfoSchema = z.object({
  email: z.string().trim().email(),
  name: z.string().trim().min(1).optional(),
  verified_email: z.boolean().optional(),
});

const documentMetadataSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  mimeType: z.literal("application/vnd.google-apps.document"),
});

const driveActivityItemSchema = z.object({
  primaryActionDetail: z.record(z.string(), z.unknown()).optional(),
  actors: z.array(z.record(z.string(), z.unknown())).optional(),
  targets: z.array(z.record(z.string(), z.unknown())).optional(),
  timestamp: z.string().trim().min(1).optional(),
  time: z.string().trim().min(1).optional(),
}).passthrough();

const driveActivityPageSchema = z.object({
  activities: z.array(driveActivityItemSchema).optional(),
  nextPageToken: z.string().trim().min(1).optional(),
}).passthrough();

export type GoogleOAuthToken = {
  ok: true;
  accessToken: string;
  expiresIn: number;
  refreshToken: string | null;
  scope: string | null;
  tokenType: string | null;
};

export type GoogleUserInfo = {
  ok: true;
  email: string;
  name: string | null;
};

export type GoogleDocumentMetadata = {
  ok: true;
  id: string;
  title: string;
};

export type GoogleDriveActivityPage = {
  ok: true;
  activities: unknown[];
  nextPageToken: string | null;
};

export type GoogleProviderFailure = {
  ok: false;
  reason: "provider_error" | "malformed_payload" | "rate_limited" | "document_not_accessible";
};

function createTimeoutSignal() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GOOGLE_API_TIMEOUT_MS);

  return { controller, timeout };
}

function parseGoogleErrorReason(payload: unknown) {
  const error = z
    .object({
      error: z
        .object({
          code: z.number().int().optional(),
          status: z.string().trim().min(1).optional(),
          message: z.string().trim().min(1).optional(),
          errors: z
            .array(
              z.object({
                reason: z.string().trim().min(1).optional(),
              }),
            )
            .optional(),
        })
        .optional(),
    })
    .passthrough()
    .safeParse(payload);

  if (!error.success) {
    return null;
  }

  const responseError = error.data.error;
  const reasons = responseError?.errors?.map((item) => item.reason).filter(Boolean);
  const status = responseError?.status?.toLowerCase();
  const code = responseError?.code;

  if (
    code === 429 ||
    status === "ratelimitexceeded" ||
    status === "too many requests" ||
    reasons?.some((reason) => reason === "rateLimitExceeded")
  ) {
    return "rate_limited" as const;
  }

  if (
    code === 403 ||
    code === 404 ||
    status === "forbidden" ||
    status === "not found" ||
    reasons?.some((reason) =>
      reason === "notFound" || reason === "forbidden" || reason === "accessDenied",
    )
  ) {
    return "document_not_accessible" as const;
  }

  return null;
}

function normalizeTokenResponse(payload: unknown): GoogleOAuthToken | GoogleProviderFailure {
  const parsed = tokenResponseSchema.safeParse(payload);

  if (!parsed.success) {
    return { ok: false, reason: "malformed_payload" };
  }

  return {
    ok: true,
    accessToken: parsed.data.access_token,
    expiresIn: parsed.data.expires_in,
    refreshToken: parsed.data.refresh_token ?? null,
    scope: parsed.data.scope ?? null,
    tokenType: parsed.data.token_type ?? null,
  };
}

export async function exchangeGoogleAuthorizationCode(input: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}): Promise<GoogleOAuthToken | GoogleProviderFailure> {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const body = new URLSearchParams();
    body.set("client_id", input.clientId);
    body.set("client_secret", input.clientSecret);
    body.set("code", input.code);
    body.set("grant_type", "authorization_code");
    body.set("redirect_uri", input.redirectUri);

    const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const reason = parseGoogleErrorReason(payload);
      return {
        ok: false,
        reason: reason ?? "provider_error",
      };
    }

    return normalizeTokenResponse(payload);
  } catch {
    return { ok: false, reason: "provider_error" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGoogleUserInfo(
  accessToken: string,
): Promise<GoogleUserInfo | GoogleProviderFailure> {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const response = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const reason = parseGoogleErrorReason(payload);
      return {
        ok: false,
        reason: reason ?? "provider_error",
      };
    }

    const parsed = userInfoSchema.safeParse(payload);

    if (!parsed.success) {
      return { ok: false, reason: "malformed_payload" };
    }

    return {
      ok: true,
      email: parsed.data.email,
      name: parsed.data.name ?? null,
    };
  } catch {
    return { ok: false, reason: "provider_error" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGoogleDocumentMetadata(input: {
  accessToken: string;
  documentId: string;
}): Promise<GoogleDocumentMetadata | GoogleProviderFailure> {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const url = new URL(
      `${GOOGLE_DRIVE_FILES_ENDPOINT}/${encodeURIComponent(input.documentId)}`,
    );
    url.searchParams.set("fields", "id,name,mimeType");

    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${input.accessToken}`,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const reason = parseGoogleErrorReason(payload);
      return {
        ok: false,
        reason: reason ?? "provider_error",
      };
    }

    const parsed = documentMetadataSchema.safeParse(payload);

    if (!parsed.success || parsed.data.id !== input.documentId) {
      return { ok: false, reason: "malformed_payload" };
    }

    return {
      ok: true,
      id: parsed.data.id,
      title: parsed.data.name,
    };
  } catch {
    return { ok: false, reason: "provider_error" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchGoogleDriveActivityPage(input: {
  accessToken: string;
  documentId: string;
  pageToken?: string | null;
}): Promise<GoogleDriveActivityPage | GoogleProviderFailure> {
  const { controller, timeout } = createTimeoutSignal();

  try {
    const response = await fetch(GOOGLE_DRIVE_ACTIVITY_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${input.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        itemName: `items/${input.documentId}`,
        pageSize: 100,
        ...(input.pageToken ? { pageToken: input.pageToken } : {}),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const reason = parseGoogleErrorReason(payload);
      return {
        ok: false,
        reason: reason ?? "provider_error",
      };
    }

    const parsed = driveActivityPageSchema.safeParse(payload);

    if (!parsed.success) {
      return { ok: false, reason: "malformed_payload" };
    }

    return {
      ok: true,
      activities: parsed.data.activities ?? [],
      nextPageToken: parsed.data.nextPageToken ?? null,
    };
  } catch {
    return { ok: false, reason: "provider_error" };
  } finally {
    clearTimeout(timeout);
  }
}

export function classifyGoogleDriveActivityType(
  activity: Record<string, unknown>,
): DocsActivityType | null {
  const detail =
    (activity.primaryActionDetail as Record<string, unknown> | undefined) ??
    (activity.actions as Array<Record<string, unknown>> | undefined)?.[0]
      ?.detail as Record<string, unknown> | undefined;

  if (!detail || typeof detail !== "object") {
    return null;
  }

  if (Object.hasOwn(detail, "edit")) {
    return "edit";
  }

  if (Object.hasOwn(detail, "comment")) {
    const comment = detail.comment;
    const commentText = JSON.stringify(comment ?? {}).toLowerCase();

    if (commentText.includes("suggest")) {
      return "suggestion";
    }

    return "comment";
  }

  if (Object.hasOwn(detail, "suggestion") || JSON.stringify(detail).toLowerCase().includes("suggest")) {
    return "suggestion";
  }

  return null;
}

export function extractGoogleDriveActivityTimestamp(
  activity: Record<string, unknown>,
): string | null {
  const timeRange = activity.timeRange;
  const rawTimestamp =
    (typeof activity.timestamp === "string" ? activity.timestamp : null) ??
    (typeof activity.time === "string" ? activity.time : null) ??
    (timeRange && typeof timeRange === "object" &&
    typeof (timeRange as Record<string, unknown>).endTime === "string"
      ? (timeRange as Record<string, unknown>).endTime as string
      : null) ??
    (timeRange && typeof timeRange === "object" &&
    typeof (timeRange as Record<string, unknown>).startTime === "string"
      ? (timeRange as Record<string, unknown>).startTime as string
      : null) ??
    null;

  if (!rawTimestamp) {
    return null;
  }

  const parsed = Date.parse(rawTimestamp);

  return Number.isNaN(parsed) ? rawTimestamp : new Date(parsed).toISOString();
}

export function extractGoogleDriveActivityId(
  activity: Record<string, unknown>,
): string | null {
  if (typeof activity.name === "string" && activity.name.trim().length > 0) {
    return activity.name.trim();
  }

  return null;
}

export function extractGoogleDriveTitle(activity: Record<string, unknown>): string | null {
  const targets = activity.targets;

  if (!Array.isArray(targets)) {
    return null;
  }

  for (const target of targets) {
    if (!target || typeof target !== "object") {
      continue;
    }

    const driveItem = (target as Record<string, unknown>).driveItem;

    if (!driveItem || typeof driveItem !== "object") {
      continue;
    }

    const title = (driveItem as Record<string, unknown>).title;

    if (typeof title === "string" && title.trim().length > 0) {
      return title.trim();
    }
  }

  return null;
}

export function extractGoogleDriveActorEmail(activity: Record<string, unknown>): string | null {
  const actors = activity.actors;

  if (!Array.isArray(actors)) {
    return null;
  }

  for (const actor of actors) {
    if (!actor || typeof actor !== "object") {
      continue;
    }

    const user = (actor as Record<string, unknown>).user;
    const email = (user as Record<string, unknown> | undefined)?.emailAddress;

    if (typeof email === "string" && email.trim().length > 0) {
      return email.trim().toLowerCase();
    }
  }

  return null;
}
