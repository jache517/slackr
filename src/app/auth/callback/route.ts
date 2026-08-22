import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type OtpType = "magiclink" | "email" | "invite" | "signup";

const OTP_TYPES = new Set<OtpType>(["magiclink", "email", "invite", "signup"]);

/**
 * Only same-site paths are followed. Anything else, including a protocol
 * relative `//evil.example`, falls back to the default so an emailed link
 * cannot be rewritten into a redirect somewhere else.
 */
function safeNext(next: string | null) {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

/**
 * Where an emailed link lands.
 *
 * Accounts are identified by username now, and nothing in the app sends mail,
 * so no link the app produces arrives here. It stays for links issued out of
 * band, such as an invite sent from the Supabase dashboard, and remains the
 * one place in the app that can write session cookies during a request.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNext(searchParams.get("next")) ?? "/projects";

  if (!code && !tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();

  const otpType: OtpType =
    type && OTP_TYPES.has(type as OtpType) ? (type as OtpType) : "magiclink";

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash as string,
        type: otpType,
      });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=expired`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
