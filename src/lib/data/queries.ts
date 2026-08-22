import "server-only";

import { cache } from "react";

import { requireSession } from "@/lib/auth/require-session";
import {
  bucket,
  dueLabelFor,
  fullDate,
  initialsOf,
  lastActiveLabel,
  longDate,
  shortDate,
  slugify,
  sourceUrl,
  syncLabel,
  trendOf,
  ALL_SOURCE_KEYS,
  SOURCE_LABELS,
  type MemberRecord,
  type ProjectRecord,
  type ProjectStatus,
  type SourceKey,
  type UnmatchedAccount,
} from "./types";

export {
  ALL_SOURCE_KEYS,
  SOURCE_LABELS,
  projectInitials,
  type MemberRecord,
  type ProjectRecord,
  type ProjectStatus,
  type SourceKey,
  type SourceRecord,
  type TrendDirection,
  type UnmatchedAccount,
} from "./types";

/**
 * The read layer. Every screen's figures are assembled here from raw activity
 * rows, so a share, a sparkline and a raw count can never disagree.
 *
 * Row-level security does the access control: these run as the signed-in
 * user's client and simply see no rows they do not own.
 *
 * Both the session lookup and the reads are cached per render pass, so a
 * screen calling `getProject`, `getProjectReport` and `getReadinessChecks`
 * authenticates once and queries once.
 */

export type MemberStats = MemberRecord & {
  events: number;
  sharePercent: number;
};

export type ProjectReport = {
  project: ProjectRecord;
  members: MemberStats[];
  totals: {
    commits: number;
    docActivity: number;
    attendances: number;
    events: number;
  };
  evenSplitPercent: number;
};

export type ReadinessCheck = {
  key: string;
  label: string;
  detail: string;
  state: "done" | "blocked";
};

export function memberEvents(member: MemberRecord) {
  return member.commits + member.docActivity + member.meetingsAttended;
}

type RawProject = {
  id: string;
  title: string;
  deadline: string;
};

/** Everything one project's screens need, in six round trips rather than N. */
async function fetchProjects(projectIds?: string[]) {
  const { supabase } = await requireSession();

  let projectQuery = supabase
    .from("projects")
    .select("id, title, deadline")
    .order("deadline", { ascending: true });
  if (projectIds) projectQuery = projectQuery.in("id", projectIds);

  const { data: projects, error } = await projectQuery;
  if (error) throw new Error(`Could not read projects: ${error.message}`);
  if (!projects || projects.length === 0) return [];

  const ids = projects.map((project) => project.id);

  const [members, sources, commits, docs, meetings, attendance] =
    await Promise.all([
      supabase
        .from("members")
        .select("id, project_id, name, github_username, google_email")
        .in("project_id", ids)
        .order("name", { ascending: true }),
      supabase
        .from("source_connections")
        .select(
          "id, project_id, source_type, external_id, display_name, last_synced_at",
        )
        .in("project_id", ids),
      supabase
        .from("github_activity")
        .select("project_id, member_id, author_username, authored_at")
        .in("project_id", ids),
      supabase
        .from("docs_activity")
        .select("project_id, member_id, occurred_at")
        .in("project_id", ids),
      supabase.from("meetings").select("id, project_id").in("project_id", ids),
      supabase
        .from("meeting_attendance")
        .select("project_id, member_id, joined_at")
        .in("project_id", ids),
    ]);

  const now = Date.now();

  return projects.map((project) =>
    assemble(project, now, {
      members: members.data ?? [],
      sources: sources.data ?? [],
      commits: commits.data ?? [],
      docs: docs.data ?? [],
      meetings: meetings.data ?? [],
      attendance: attendance.data ?? [],
    }),
  );
}

type Rows = {
  members: {
    id: string;
    project_id: string;
    name: string;
    github_username: string | null;
    google_email: string | null;
  }[];
  sources: {
    project_id: string;
    source_type: string;
    external_id: string;
    display_name: string;
    last_synced_at: string | null;
  }[];
  commits: {
    project_id: string;
    member_id: string | null;
    author_username: string | null;
    authored_at: string;
  }[];
  docs: { project_id: string; member_id: string | null; occurred_at: string }[];
  meetings: { id: string; project_id: string }[];
  attendance: {
    project_id: string;
    member_id: string | null;
    joined_at: string | null;
  }[];
};

function assemble(
  project: RawProject,
  now: number,
  rows: Rows,
): ProjectRecord {
  const mine = <T extends { project_id: string }>(list: T[]) =>
    list.filter((row) => row.project_id === project.id);

  const memberRows = mine(rows.members);
  const commitRows = mine(rows.commits);
  const docRows = mine(rows.docs);
  const attendanceRows = mine(rows.attendance);
  const sourceRows = mine(rows.sources);

  const members: MemberRecord[] = memberRows.map((row) => {
    const at = (list: { member_id: string | null }[], key: string) =>
      list
        .filter((entry) => entry.member_id === row.id)
        .map((entry) => (entry as unknown as Record<string, string>)[key])
        .filter(Boolean);

    const commitTimes = at(commitRows, "authored_at");
    const docTimes = at(docRows, "occurred_at");
    const meetTimes = at(attendanceRows, "joined_at");
    const all = [...commitTimes, ...docTimes, ...meetTimes].sort();
    const series = bucket(all, now);

    return {
      id: row.id,
      slug: slugify(row.name),
      name: row.name,
      initials: initialsOf(row.name),
      githubUsername: row.github_username ?? "",
      googleEmail: row.google_email ?? "",
      commits: commitTimes.length,
      docActivity: docTimes.length,
      meetingsAttended: attendanceRows.filter(
        (entry) => entry.member_id === row.id,
      ).length,
      lastActive: lastActiveLabel(all.at(-1) ?? null, now),
      trend: trendOf(series),
      weeklyEvents: series,
    };
  });

  // The project's own series is the sum of its members', not a separate number.
  const projectSeries = bucket(
    [
      ...commitRows.filter((row) => row.member_id).map((row) => row.authored_at),
      ...docRows.filter((row) => row.member_id).map((row) => row.occurred_at),
      ...attendanceRows
        .filter((row) => row.member_id && row.joined_at)
        .map((row) => row.joined_at as string),
    ],
    now,
  );

  const unmatchedAccount = findUnmatched(commitRows, sourceRows);
  const totalEvents = projectSeries.reduce((sum, n) => sum + n, 0);

  const status: ProjectStatus = unmatchedAccount
    ? "needs_attention"
    : totalEvents === 0
      ? "too_early"
      : "collecting";

  const sources = ALL_SOURCE_KEYS.map((key) => {
    const row = sourceRows.find((entry) => entry.source_type === key);

    return {
      key,
      label: SOURCE_LABELS[key],
      connected: Boolean(row),
      displayName: row?.display_name ?? null,
      externalId: row?.external_id ?? null,
      url: sourceUrl(key, row?.external_id ?? null),
      lastSyncLabel: syncLabel(row?.last_synced_at ?? null, now),
    };
  });

  const membersWithActivity = members.filter(
    (member) =>
      member.commits + member.docActivity + member.meetingsAttended > 0,
  ).length;

  const lastSynced = sourceRows
    .map((row) => row.last_synced_at)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return {
    id: project.id,
    title: project.title,
    status,
    dueLabel: dueLabelFor(project.deadline, now),
    memberCount: members.length,
    trend: trendOf(projectSeries),
    weeklyEvents: totalEvents === 0 ? [] : projectSeries,
    statusLine: statusLineFor(status, members.length, unmatchedAccount),
    connectedSources: [
      ...new Set(sourceRows.map((row) => row.source_type as SourceKey)),
    ],
    sources,
    unmatchedAccount,
    meetingsHeld: mine(rows.meetings).length,
    lastCollected: lastSynced ? shortDate(lastSynced) : "Not yet",
    lastCollectedLabel: lastSynced ? longDate(lastSynced) : "Not yet",
    deadlineLabel: fullDate(project.deadline),
    coveragePercent:
      members.length === 0
        ? 0
        : Math.round((membersWithActivity / members.length) * 100),
    membersWithActivity,
    members,
  };
}

/**
 * The largest GitHub account in this project that is matched to nobody. Its
 * commits are being counted for no one, which is the one thing that makes a
 * report understate someone.
 */
function findUnmatched(
  commitRows: Rows["commits"],
  sourceRows: Rows["sources"],
): UnmatchedAccount | null {
  const orphans = commitRows.filter(
    (row) => !row.member_id && row.author_username,
  );
  if (orphans.length === 0) return null;

  const byHandle = new Map<string, string[]>();
  for (const row of orphans) {
    const handle = row.author_username as string;
    byHandle.set(handle, [...(byHandle.get(handle) ?? []), row.authored_at]);
  }

  const [handle, times] = [...byHandle.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  )[0];

  return {
    source: "github",
    handle,
    commits: times.length,
    repository:
      sourceRows.find((row) => row.source_type === "github")?.display_name ??
      "the repository",
    since: shortDate([...times].sort()[0]),
  };
}

function statusLineFor(
  status: ProjectStatus,
  memberCount: number,
  unmatched: UnmatchedAccount | null,
) {
  if (status === "needs_attention" && unmatched) {
    return `One GitHub account with ${unmatched.commits} commits is matched to nobody, so the report would understate someone.`;
  }
  if (status === "too_early") {
    return "Nothing collected yet. There is not enough here to report on.";
  }
  return `Enough data to report on all ${memberCount} members.`;
}

/* ---------- Accessors ---------- */

const loadAll = cache(async () => fetchProjects());

const loadOne = cache(async (projectId: string) => {
  const [project] = await fetchProjects([projectId]);
  return project ?? null;
});

export async function listProjects(): Promise<ProjectRecord[]> {
  return loadAll();
}

export async function getProject(
  projectId: string,
): Promise<ProjectRecord | null> {
  return loadOne(projectId);
}

export async function getProjectReport(
  projectId: string,
): Promise<ProjectReport | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const totals = project.members.reduce(
    (acc, member) => ({
      commits: acc.commits + member.commits,
      docActivity: acc.docActivity + member.docActivity,
      attendances: acc.attendances + member.meetingsAttended,
      events: acc.events + memberEvents(member),
    }),
    { commits: 0, docActivity: 0, attendances: 0, events: 0 },
  );

  const members: MemberStats[] = project.members
    .map((member) => {
      const events = memberEvents(member);
      return {
        ...member,
        events,
        sharePercent:
          totals.events === 0 ? 0 : Math.round((events / totals.events) * 100),
      };
    })
    .sort((a, b) => b.sharePercent - a.sharePercent);

  return {
    project,
    members,
    totals,
    evenSplitPercent:
      project.members.length === 0
        ? 0
        : Math.round(100 / project.members.length),
  };
}

export async function getMemberDetail(projectId: string, memberSlug: string) {
  const report = await getProjectReport(projectId);
  if (!report) return null;

  const member = report.members.find((entry) => entry.slug === memberSlug);
  if (!member) return null;

  const others = report.members.filter((entry) => entry.slug !== memberSlug);

  return {
    ...report,
    member,
    medians: {
      commits: median(others.map((entry) => entry.commits)),
      docActivity: median(others.map((entry) => entry.docActivity)),
      meetings: median(others.map((entry) => entry.meetingsAttended)),
    },
  };
}

/**
 * Group median: the middle value for the other members. The subject is
 * excluded so nobody is compared against themselves.
 */
function median(values: number[]) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

export async function getReadinessChecks(
  projectId: string,
): Promise<ReadinessCheck[] | null> {
  const report = await getProjectReport(projectId);
  if (!report) return null;

  const { project, totals } = report;
  const checks: ReadinessCheck[] = [
    {
      key: "members",
      label: "All members linked",
      detail: project.members.map((member) => member.name.split(" ")[0]).join(", "),
      state: "done",
    },
  ];

  if (project.unmatchedAccount) {
    const account = project.unmatchedAccount;
    checks.push({
      key: "matched",
      label: "Matched accounts",
      detail: `1 GitHub account, ${account.handle}, is matched to nobody. Its ${account.commits} commits are left out.`,
      state: "blocked",
    });
  }

  const sourceDetail: Record<SourceKey, string> = {
    github: `${project.unmatchedAccount?.repository ?? "the repository"} - ${totals.commits} commits`,
    google_docs: `Final Project Report - ${totals.docActivity} edits, comments and suggestions`,
    google_meet: `Weekly stand-up calendar - ${project.meetingsHeld} meetings, ${totals.attendances} attendances`,
  };

  const sourceLabel: Record<SourceKey, string> = {
    github: "GitHub",
    google_docs: "Google Docs",
    google_meet: "Google Meet",
  };

  for (const source of ["github", "google_docs", "google_meet"] as const) {
    const connected = project.connectedSources.includes(source);
    checks.push({
      key: source,
      label: sourceLabel[source],
      detail: connected
        ? sourceDetail[source]
        : `Not connected. ${sourceLabel[source]} data will be blank for all members.`,
      state: connected ? "done" : "blocked",
    });
  }

  return checks;
}
