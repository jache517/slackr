import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/require-user";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Page-level guard. Unlike `requireUser`, which answers an API caller with a
 * 401, this sends a browser to sign in. RLS is still what actually protects
 * the rows; this decides whether a page is rendered at all.
 *
 * Cached per render pass. Without that, a screen that calls three accessors
 * verifies the session three times against a refresh token that rotates
 * underneath it, and the later calls fall back to the anon role.
 */
export const requireSession = cache(async () => {
  const supabase = await createServerSupabaseClient();
  const user = await getCurrentUser(supabase);

  if (!user) redirect("/login");

  return { supabase, user };
});
