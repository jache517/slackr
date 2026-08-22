import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type OtpType = "magiclink" | "email" | "recovery" | "invite" | "signup";

const OTP_TYPES = new Set<OtpType>([
  "magiclink",
  "email",
  "recovery",
  "invite",
  "signup",
]);

/**
 * Only same-site paths are followed. Anything else, including a protocol
 * relative `//evil.example`, falls back to the default so the emailed link
 * cannot be rewritten into a redirect somewhere else.
 */
function safeNext(next: string | null) {
  if (!next) return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

/**
 * Where an emailed link lands. This is the one place in the app that can write
 * session cookies during a request, so every link shape is exchanged here:
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

  // A recovery link means the reader is here to choose a new password, not to
  // be dropped into the app with a session they did not ask for.
  const destination = otpType === "recovery" ? "/reset-password" : next;

  return NextResponse.redirect(`${origin}${destination}`);
}
