import type { AuthError } from "@supabase/supabase-js";

/**
 * Client-side minimum. Supabase enforces its own minimum server-side; this is
 * set higher so the reader is told before submitting rather than after.
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Turns a Supabase auth failure into something worth reading.
 *
 * Sign-in is deliberately vague: the same message covers an unknown username
 * and a wrong password, so the form cannot be used to discover which names
 * have accounts. Sign-up has to be specific, because "that name is taken" is
 * the one thing the reader needs in order to pick another.
 */
export function authErrorMessage(
  error: AuthError,
  context: "sign-in" | "sign-up",
) {
  switch (error.code) {
    case "invalid_credentials":
      return "That username and password do not match an account.";

    case "user_already_exists":
    case "email_exists":
      return "That username is taken. Pick another.";

    case "weak_password":
      return `Pick a longer password: at least ${MIN_PASSWORD_LENGTH} characters.`;

    case "over_request_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";

    case "signup_disabled":
      return "New accounts are turned off for this site.";

    // Only reachable when the project still requires addresses to be
    // confirmed, which cannot work for usernames: nothing can receive the
    // mail. Says what to do rather than telling the reader to check an inbox
    // that does not exist.
    case "email_not_confirmed":
      return "This site is not set up for username accounts yet. Ask an admin to turn off email confirmation.";

    default:
      break;
  }

  if (context === "sign-in") {
    return "That username and password do not match an account.";
  }

  return "Something went wrong. Try again.";
}

/** True when the network never reached Supabase, rather than Supabase refusing. */
export function isOffline(error: unknown) {
  return error instanceof TypeError;
}
