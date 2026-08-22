import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getActivityScope,
  type ActivityScope,
} from "@/lib/activity/activity-repository";
import type { Database } from "@/types/database";

export async function getReportScope(
  supabase: SupabaseClient<Database>,
  projectId: string,
): Promise<ActivityScope> {
  return getActivityScope(supabase, projectId);
}
