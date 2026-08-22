/**
 * The New Project draft: everything the wizard collects before anything is
 * written. It lives in the browser until the last step, so abandoning the
 * flow leaves nothing behind.
 *
 * The checks here mirror `project-validation` and `member-validation` on the
 * server. They are a courtesy, not the guard - the server still rejects what
 * it does not like, and the wizard shows what it says.
 */

export type MemberDraft = {
  /** Client-side identity for the row. Never sent anywhere. */
  key: string;
  name: string;
  email: string;
  githubUsername: string;
  googleEmail: string;
};

export type Draft = {
  title: string;
  dueDate: string;
  members: MemberDraft[];
  githubUrl: string;
  googleDocUrl: string;
};

export type SourceErrors = { githubUrl?: string; googleDocUrl?: string };

export type MemberErrors = Partial<Omit<MemberDraft, "key">>;

const GITHUB_USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyMember(): MemberDraft {
  return {
    key: crypto.randomUUID(),
    name: "",
    email: "",
    githubUsername: "",
    googleEmail: "",
  };
}

export function emptyDraft(): Draft {
  return {
    title: "",
    dueDate: "",
    members: [emptyMember()],
    githubUrl: "",
    googleDocUrl: "",
  };
}

export function formatDue(value: string) {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function validateProjectInfo(draft: Draft) {
  const errors: { title?: string; dueDate?: string } = {};

  if (!draft.title.trim()) errors.title = "Give the project a title.";
  if (draft.title.trim().length > 120) {
    errors.title = "Keep the title to 120 characters or fewer.";
  }
  if (!draft.dueDate) errors.dueDate = "Choose a deadline.";

  return errors;
}

/**
 * Identities are unique within a project on the server, so a repeat inside
 * the draft is caught here rather than as a 409 after the project exists.
 */
function duplicateKeys(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const repeated = new Set<string>();

  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }

  return repeated;
}

export function validateMembers(members: MemberDraft[]) {
  const normalise = (value: string) => value.trim().toLowerCase();
  const repeatedGithub = duplicateKeys(
    members.map((member) => normalise(member.githubUsername) || undefined),
  );
  const repeatedEmail = duplicateKeys(
    members.map((member) => normalise(member.email) || undefined),
  );
  const repeatedGoogle = duplicateKeys(
    members.map((member) => normalise(member.googleEmail) || undefined),
  );

  const errors = new Map<string, MemberErrors>();

  for (const member of members) {
    const row: MemberErrors = {};

    if (!member.name.trim()) {
      row.name = "Give this member a name.";
    } else if (member.name.trim().length > 120) {
      row.name = "Keep the name to 120 characters or fewer.";
    }

    const email = normalise(member.email);
    if (email && !EMAIL_PATTERN.test(email)) {
      row.email = "Enter a valid email address.";
    } else if (email && repeatedEmail.has(email)) {
      row.email = "Two members cannot share an email address.";
    }

    const github = normalise(member.githubUsername);
    if (github && !GITHUB_USERNAME_PATTERN.test(github)) {
      row.githubUsername =
        "Letters, digits and hyphens only, not starting or ending with a hyphen.";
    } else if (github && repeatedGithub.has(github)) {
      row.githubUsername = "Two members cannot share a GitHub username.";
    }

    const google = normalise(member.googleEmail);
    if (google && !EMAIL_PATTERN.test(google)) {
      row.googleEmail = "Enter a valid email address.";
    } else if (google && repeatedGoogle.has(google)) {
      row.googleEmail = "Two members cannot share a Google account.";
    }

    if (Object.keys(row).length > 0) errors.set(member.key, row);
  }

  return errors;
}

/** The member payload the API expects, with blanks sent as `null`. */
export function memberPayload(member: MemberDraft) {
  const orNull = (value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

  return {
    name: member.name.trim(),
    email: orNull(member.email),
    githubUsername: orNull(member.githubUsername),
    googleEmail: orNull(member.googleEmail),
  };
}

/**
 * The source URL checks the wizard can make without the server's
 * canonicaliser, which lives behind `next/server` imports and stays there.
 * These catch the wrong host or the wrong shape of link; whether the
 * repository is public, and whether the document can be read, is the
 * server's answer to give.
 */
export function validateSources(draft: Draft): SourceErrors {
  const errors: SourceErrors = {};
  const github = draft.githubUrl.trim();
  const doc = draft.googleDocUrl.trim();

  if (github && !parseHttpsUrl(github, "github.com", /^\/[^/]+\/[^/]+$/)) {
    errors.githubUrl =
      "Use the repository's web address, like https://github.com/owner/repository.";
  }

  if (
    doc &&
    !parseHttpsUrl(doc, "docs.google.com", /^\/document\/d\/[^/]+(\/.*)?$/)
  ) {
    errors.googleDocUrl =
      "Use the document's web address, like https://docs.google.com/document/d/...";
  }

  return errors;
}

function parseHttpsUrl(value: string, host: string, path: RegExp) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  const pathname = url.pathname.replace(/\/$/, "").replace(/\.git$/, "");

  return url.protocol === "https:" && hostname === host && path.test(pathname);
}
