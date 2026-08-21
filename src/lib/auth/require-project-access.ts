import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AuthenticatedUser } from "@/lib/auth/require-user";
import type { Database } from "@/types/database";

type OwnedProject = Pick<
  Database["public"]["Tables"]["projects"]["Row"],
  "id" | "created_by"
>;

export type ProjectAccessResult =
  | { ok: true; project: OwnedProject }
  | { ok: false; reason: "not_found" | "database_error" };

export async function requireProjectAccess(
  supabase: SupabaseClient<Database>,
  user: AuthenticatedUser,
  projectId: string,
): Promise<ProjectAccessResult> {
  const { data, error } = await supabase
    .from("projects")
    .select("id, created_by")
    .eq("id", projectId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, project: data };
}
