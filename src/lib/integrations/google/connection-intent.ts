import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const GOOGLE_INTENT_TTL_MS = 10 * 60 * 1000;

function createOpaqueState() {
  return randomBytes(32).toString("base64url");
}

export function hashGoogleOAuthState(state: string) {
  return createHash("sha256").update(state, "utf8").digest("hex");
}

export type CreateGoogleIntentResult =
  | { ok: true; state: string }
  | {
      ok: false;
      reason: "source_already_connected" | "source_type_already_connected" | "temporarily_unavailable";
    };

export async function createGoogleOAuthIntent(
  supabase: SupabaseClient<Database>,
  projectId: string,
  externalId: string,
): Promise<CreateGoogleIntentResult> {
  const state = createOpaqueState();
  const expiresAt = new Date(Date.now() + GOOGLE_INTENT_TTL_MS).toISOString();
  const { error } = await supabase.rpc("create_google_oauth_intent", {
    p_project_id: projectId,
    p_external_id: externalId,
    p_state_hash: hashGoogleOAuthState(state),
    p_expires_at: expiresAt,
  });

  if (!error) return { ok: true, state };

  if (error.message === "source_already_connected") {
    return { ok: false, reason: "source_already_connected" };
  }

  if (error.message === "source_type_already_connected") {
    return { ok: false, reason: "source_type_already_connected" };
  }

  return { ok: false, reason: "temporarily_unavailable" };
}

export type GoogleOAuthIntent = {
  projectId: string;
  requestedByUserId: string;
  externalId: string;
  expiresAt: string;
  consumedAt: string | null;
};

type GoogleOAuthIntentLookupFailure = {
  ok: false;
  reason: "not_found" | "database_error";
};

function mapIntent(row: {
  project_id: string;
  requested_by_user_id: string;
  external_id: string;
  expires_at: string;
  consumed_at: string | null;
}): GoogleOAuthIntent {
  return {
    projectId: row.project_id,
    requestedByUserId: row.requested_by_user_id,
    externalId: row.external_id,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
  };
}

export async function inspectGoogleOAuthIntent(
  supabase: SupabaseClient<Database>,
  state: string,
): Promise<
  | { ok: true; intent: GoogleOAuthIntent }
  | GoogleOAuthIntentLookupFailure
> {
  const { data, error } = await supabase.rpc("inspect_google_oauth_intent", {
    p_state_hash: hashGoogleOAuthState(state),
  });

  if (error) return { ok: false, reason: "database_error" };

  const row = data[0];
  return row
    ? { ok: true, intent: mapIntent(row) }
    : { ok: false, reason: "not_found" };
}

export async function consumeGoogleOAuthIntent(
  supabase: SupabaseClient<Database>,
  state: string,
): Promise<
  | { ok: true; intent: Omit<GoogleOAuthIntent, "consumedAt"> }
  | GoogleOAuthIntentLookupFailure
> {
  const { data, error } = await supabase.rpc("consume_google_oauth_intent", {
    p_state_hash: hashGoogleOAuthState(state),
  });

  if (error) return { ok: false, reason: "database_error" };

  const row = data[0];
  return row
    ? {
        ok: true,
        intent: {
          projectId: row.project_id,
          requestedByUserId: row.requested_by_user_id,
          externalId: row.external_id,
          expiresAt: row.expires_at,
        },
      }
    : { ok: false, reason: "not_found" };
}
