import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Where a magic link lands. This is the one place in the app that can write
 * session cookies during a request, so both link shapes are exchanged here:
 *
 * - `?code=` is the PKCE flow the browser client starts, and needs the
 *   verifier it stored when the link was requested.
 * - `?token_hash=&type=` is the server-side flow, which carries no verifier
 *   and so also works for a link opened in a different browser than the one
 *   that asked for it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!code && !tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash as string,
        type: (type as "magiclink" | "email") ?? "magiclink",
      });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=expired`);
  }

  return NextResponse.redirect(`${origin}/projects`);
}
