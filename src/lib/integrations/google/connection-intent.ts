import "server-only";

import { createHash, randomBytes } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const GOOGLE_INTENT_TTL_MS = 10 * 60 * 1000;

function createOpaqueState() {
  return randomBytes(32).toString("base64url");
}

function hashState(state: string) {
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
    p_state_hash: hashState(state),
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
