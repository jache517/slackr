import type { AuthError } from "@supabase/supabase-js";

/**
 * Client-side minimum. Supabase enforces its own minimum server-side; this is
 * set higher so the reader is told before submitting rather than after.
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Turns a Supabase auth failure into something worth reading.
 *
 * Sign-in is deliberately vague: the same message covers an unknown address
 * and a wrong password, so the form cannot be used to discover which addresses
 * have accounts. Everywhere else the reader already knows the address is
 * theirs, so naming the real problem costs nothing and saves a guess.
 */
export function authErrorMessage(
  error: AuthError,
  context: "sign-in" | "sign-up" | "recover" | "update",
) {
  switch (error.code) {
    case "invalid_credentials":
      return "That email and password do not match an account.";

    case "email_not_confirmed":
      return "Confirm your email address first. Check your inbox for the link.";

    case "user_already_exists":
    case "email_exists":
      return "An account already uses that email address. Sign in instead.";

    case "weak_password":
      return `Pick a longer password: at least ${MIN_PASSWORD_LENGTH} characters.`;

    case "same_password":
      return "That is already your password. Pick a different one.";

    case "over_email_send_rate_limit":
      return "Too many emails requested. Wait a few minutes and try again.";

    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";

    case "signup_disabled":
      return "New accounts are turned off for this site.";

    case "otp_expired":
      return "That link has expired. Request a new one.";

    default:
      break;
  }

  if (context === "sign-in") {
    return "That email and password do not match an account.";
  }

  return "Something went wrong. Try again.";
}

/** True when the network never reached Supabase, rather than Supabase refusing. */
export function isOffline(error: unknown) {
  return error instanceof TypeError;
}
