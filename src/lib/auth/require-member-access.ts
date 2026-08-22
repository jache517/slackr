import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { requireProjectAccess } from "@/lib/auth/require-project-access";
import type { AuthenticatedUser } from "@/lib/auth/require-user";
import type { Database } from "@/types/database";

type MemberAccessRow = Pick<
  Database["public"]["Tables"]["members"]["Row"],
  "id" | "project_id"
>;

type OwnedMember = {
  id: string;
  projectId: string;
};

export type MemberAccessResult =
  | { ok: true; member: OwnedMember }
  | { ok: false; reason: "not_found" | "database_error" };

export async function requireMemberAccess(
  supabase: SupabaseClient<Database>,
  user: AuthenticatedUser,
  memberId: string,
): Promise<MemberAccessResult> {
  const { data, error } = await supabase
    .from("members")
    .select("id, project_id")
    .eq("id", memberId)
    .maybeSingle()
    .overrideTypes<MemberAccessRow | null, { merge: false }>();

  if (error) {
    return { ok: false, reason: "database_error" };
  }

  if (!data) {
    return { ok: false, reason: "not_found" };
  }

  const projectAccess = await requireProjectAccess(
    supabase,
    user,
    data.project_id,
  );

  if (!projectAccess.ok) {
    return projectAccess.reason === "not_found"
      ? { ok: false, reason: "not_found" }
      : { ok: false, reason: "database_error" };
  }

  return {
    ok: true,
    member: { id: data.id, projectId: data.project_id },
  };
}
