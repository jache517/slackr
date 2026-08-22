import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { errorResponse } from "@/lib/api/response";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AuthenticatedUser = {
  id: string;
  email: string | null;
};

type AuthenticatedResult = {
  ok: true;
  user: AuthenticatedUser;
  supabase: SupabaseClient<Database>;
};

type UnauthenticatedResult = {
  ok: false;
  response: ReturnType<typeof errorResponse>;
};

export async function getCurrentUser(
  supabase: SupabaseClient<Database>,
): Promise<AuthenticatedUser | null> {
  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims?.sub;

  if (error || typeof subject !== "string" || subject.length === 0) {
    return null;
  }

  const email = data?.claims?.email;

  return { id: subject, email: typeof email === "string" ? email : null };
}

export async function requireUser(
  client?: SupabaseClient<Database>,
): Promise<AuthenticatedResult | UnauthenticatedResult> {
  const supabase = client ?? (await createServerSupabaseClient());
  const user = await getCurrentUser(supabase);

  if (!user) {
    return {
      ok: false,
      response: errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required",
        401,
      ),
    };
  }

  return { ok: true, user, supabase };
}
