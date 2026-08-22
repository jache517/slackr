/**
 * The shapes the six screens render, and the pure derivations behind them.
 *
 * Nothing here touches the database. Everything a screen shows is computed
 * from raw activity rows so no figure can drift from another: shares come
 * from event counts, trends from timestamps, and the four-week series from
 * the same rows the totals are built from.
 */

export type ProjectStatus = "needs_attention" | "collecting" | "too_early";

export type TrendDirection = "rising" | "steady" | "declining" | "no_data";

export type SourceKey = "github" | "google_docs" | "google_meet";

export const SOURCE_LABELS: Record<SourceKey, string> = {
  github: "GitHub",
  google_docs: "Google Docs",
  google_meet: "Google Meet",
};

export type MemberRecord = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  githubUsername: string;
  googleEmail: string;
  commits: number;
  /** Edits, comments and suggestions together: reviewing is contributing. */
  docActivity: number;
  meetingsAttended: number;
  lastActive: string;
  trend: TrendDirection;
  weeklyEvents: number[];
};

export type UnmatchedAccount = {
  source: SourceKey;
  handle: string;
  commits: number;
  repository: string;
  since: string;
};

export type ProjectRecord = {
  id: string;
  title: string;
  status: ProjectStatus;
  dueLabel: string;
  memberCount: number;
  trend: TrendDirection;
  weeklyEvents: number[];
  statusLine: string;
  connectedSources: SourceKey[];
  unmatchedAccount: UnmatchedAccount | null;
  meetingsHeld: number;
  lastCollected: string;
  members: MemberRecord[];
};

/* ---------- Naming ---------- */

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Compact badge for a project: the first letter of its first two words.
 * "COMP30022 Final Project" -> "CF".
 */
export const projectInitials = initialsOf;

/* ---------- Time ---------- */

export const WEEKS = 4;
const DAY = 86_400_000;

/**
 * Which of the four weekly buckets a timestamp falls in, or -1 if it is
 * older than the window. Bucket 0 is the oldest of the four.
 */
export function weekIndex(at: string, now: number) {
  const age = now - new Date(at).getTime();
  if (age < 0) return WEEKS - 1;
  const weeksAgo = Math.floor(age / (7 * DAY));
  if (weeksAgo >= WEEKS) return -1;
  return WEEKS - 1 - weeksAgo;
}

export function bucket(timestamps: string[], now: number) {
  const series = Array<number>(WEEKS).fill(0);
  for (const at of timestamps) {
    const index = weekIndex(at, now);
    if (index >= 0) series[index] += 1;
  }
  return series;
}

/**
 * Direction over the window: the later half against the earlier half. A tenth
 * either way is the threshold, so ordinary week-to-week noise reads as steady.
 */
export function trendOf(series: number[]): TrendDirection {
  const total = series.reduce((sum, n) => sum + n, 0);
  if (total === 0) return "no_data";

  const half = Math.floor(series.length / 2);
  const earlier = series.slice(0, half).reduce((sum, n) => sum + n, 0);
  const later = series.slice(half).reduce((sum, n) => sum + n, 0);

  if (earlier === 0) return later > 0 ? "rising" : "steady";
  const change = (later - earlier) / earlier;
  if (change > 0.1) return "rising";
  if (change < -0.1) return "declining";
  return "steady";
}

function startOfDay(ms: number) {
  const date = new Date(ms);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function lastActiveLabel(at: string | null, now: number) {
  if (!at) return "No activity yet";
  const days = Math.round(
    (startOfDay(now) - startOfDay(new Date(at).getTime())) / DAY,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export function shortDate(at: string) {
  return new Date(at).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function dueLabelFor(deadline: string, now: number) {
  const days = Math.round(
    (startOfDay(new Date(`${deadline}T00:00:00`).getTime()) - startOfDay(now)) /
      DAY,
  );
  if (days < 0) {
    return `overdue by ${Math.abs(days)} day${days === -1 ? "" : "s"}`;
  }
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  if (days <= 7) return `due in ${days} days`;
  return `due ${new Date(`${deadline}T00:00:00`).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}
