import {
  PROJECTS,
  type MemberRecord,
  type ProjectRecord,
  type SourceKey,
} from "./fixtures";

export type {
  MemberRecord,
  ProjectRecord,
  ProjectStatus,
  SourceKey,
  TrendDirection,
  UnmatchedAccount,
} from "./fixtures";

/**
 * Read seam for the interface. These are async so swapping the fixture
 * arrays for Supabase queries does not change any caller.
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
    docEdits: number;
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
  return member.commits + member.docEdits + member.meetingsAttended;
}

export async function listProjects(): Promise<ProjectRecord[]> {
  return PROJECTS;
}

export async function getProject(
  projectId: string,
): Promise<ProjectRecord | null> {
  return PROJECTS.find((project) => project.id === projectId) ?? null;
}

export async function getProjectReport(
  projectId: string,
): Promise<ProjectReport | null> {
  const project = await getProject(projectId);
  if (!project) return null;

  const totals = project.members.reduce(
    (acc, member) => ({
      commits: acc.commits + member.commits,
      docEdits: acc.docEdits + member.docEdits,
      attendances: acc.attendances + member.meetingsAttended,
      events: acc.events + memberEvents(member),
    }),
    { commits: 0, docEdits: 0, attendances: 0, events: 0 },
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
      docEdits: median(others.map((entry) => entry.docEdits)),
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
    github: `group3/final-project - ${totals.commits} commits`,
    google_docs: `Final Project Report - ${totals.docEdits} edits`,
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

/**
 * Compact badge for a project: the first letter of its first two words.
 * "COMP30022 Final Project" -> "CF". Falls back to the first two characters
 * when the title is a single word.
 */
export function projectInitials(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
