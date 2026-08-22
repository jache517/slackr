/**
 * Usernames, and the addresses they stand in for.
 *
 * Supabase Auth identifies an account by email address, with no username of
 * its own. Rather than ask people for an address the app never sends anything
 * to, each username is mapped to one inside `slackr.test`. That TLD is
 * reserved by RFC 2606 and can never be registered, so a synthesised address
 * can never collide with somebody's real one.
 *
 * The mapping is total and one-way-stable: the same username always produces
 * the same address, so it is a lookup rather than something to store.
 */

const INTERNAL_DOMAIN = "slackr.test";

export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 30;

/** Letters, digits, hyphen and underscore, starting and ending alphanumeric. */
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

/** Usernames are matched case-insensitively, so they are stored folded down. */
export function normaliseUsername(input: string) {
  return input.trim().toLowerCase();
}

/**
 * Returns the reason a username is unusable, or null when it is fine. The
 * caller decides whether to show it; every message names the actual rule
 * rather than saying the name is invalid.
 */
export function usernameProblem(input: string) {
  const username = normaliseUsername(input);

  if (username.length === 0) {
    return "Enter a username.";
  }

  if (username.length < MIN_USERNAME_LENGTH) {
    return `Use at least ${MIN_USERNAME_LENGTH} characters.`;
  }

  if (username.length > MAX_USERNAME_LENGTH) {
    return `Use at most ${MAX_USERNAME_LENGTH} characters.`;
  }

  if (username.includes("@")) {
    return "Usernames have no @ in them. Just the name.";
  }

  if (!USERNAME_PATTERN.test(username)) {
    return "Use letters and numbers, with hyphens or underscores inside.";
  }

  return null;
}

/** The address Supabase Auth knows this username by. */
export function usernameToEmail(input: string) {
  return `${normaliseUsername(input)}@${INTERNAL_DOMAIN}`;
}

/** The username behind an internal address, for showing an account back. */
export function emailToUsername(email: string) {
  const suffix = `@${INTERNAL_DOMAIN}`;
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}
