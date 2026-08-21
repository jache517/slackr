"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getPublicSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getPublicSupabaseEnv();

  return createBrowserClient<Database>(url, publishableKey);
}
