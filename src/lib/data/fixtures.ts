/**
 * Sample data for the interface build.
 *
 * Every figure here reconciles with the others:
 *   commits 18+16+13+2 = 49
 *   doc activity 14+11+12+3 = 40
 *   attendances 4+4+4+2 = 14
 *   events per member = commits + doc activity + attendances -> 36, 31, 29, 7
 *   total events 49+40+14 = 103
 *   shares = events/103 -> 35, 30, 28, 7 (sum 100)
 *
 * Weekly series sum to each member's event count, so a sparkline never
 * contradicts the row beside it.
 */

export type ProjectStatus = "needs_attention" | "collecting" | "too_early";

export type TrendDirection = "rising" | "steady" | "declining" | "no_data";

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

export type SourceKey = "github" | "google_docs" | "google_meet";

export type UnmatchedAccount = {
  source: SourceKey;
  handle: string;
  commits: number;
  repository: string;
  since: string;
};

export const SOURCE_LABELS: Record<SourceKey, string> = {
  github: "GitHub",
  google_docs: "Google Docs",
  google_meet: "Google Meet",
};

const comp30022Members: MemberRecord[] = [
  {
    id: "m-alice",
    slug: "alice-zhang",
    name: "Alice Zhang",
    initials: "AZ",
    githubUsername: "alice-dev",
    googleEmail: "alice.zhang@unitech.edu.au",
    commits: 18,
    docActivity: 14,
    meetingsAttended: 4,
    lastActive: "Today",
    trend: "rising",
    weeklyEvents: [4, 9, 12, 11],
  },
  {
    id: "m-sheldon",
    slug: "sheldon-chen",
    name: "Sheldon Chen",
    initials: "SC",
    githubUsername: "sheldonchen",
    googleEmail: "sheldon.chen@unitech.edu.au",
    commits: 16,
    docActivity: 11,
    meetingsAttended: 4,
    lastActive: "Today",
    trend: "rising",
    weeklyEvents: [5, 7, 9, 10],
  },
  {
    id: "m-bob",
    slug: "bob-wang",
    name: "Bob Wang",
    initials: "BW",
    githubUsername: "bobcode",
    googleEmail: "bob.wang@unitech.edu.au",
    commits: 13,
    docActivity: 12,
    meetingsAttended: 4,
    lastActive: "Yesterday",
    trend: "declining",
    weeklyEvents: [11, 8, 6, 4],
  },
  {
    id: "m-kevin",
    slug: "kevin-liu",
    name: "Kevin Liu",
    initials: "KL",
    githubUsername: "kevinliu97",
    googleEmail: "kevin.liu@unitech.edu.au",
    commits: 2,
    docActivity: 3,
    meetingsAttended: 2,
    lastActive: "3 days ago",
    trend: "declining",
    weeklyEvents: [3, 2, 1, 1],
  },
];

export const PROJECTS: ProjectRecord[] = [
  {
    id: "comp30022",
    title: "COMP30022 Final Project",
    status: "needs_attention",
    dueLabel: "due in 2 days",
    memberCount: 4,
    trend: "rising",
    weeklyEvents: [9, 14, 22, 31],
    statusLine:
      "One GitHub account with 6 commits is matched to nobody, so the report would understate someone.",
    connectedSources: ["github", "google_docs", "google_meet"],
    unmatchedAccount: {
      source: "github",
      handle: "a-zhang-uni",
      commits: 6,
      repository: "group3/final-project",
      since: "4 Aug",
    },
    meetingsHeld: 4,
    lastCollected: "28 Aug",
    members: comp30022Members,
  },
  {
    id: "info20003",
    title: "INFO20003 Group Project",
    status: "collecting",
    dueLabel: "due 5 Oct 2025",
    memberCount: 5,
    trend: "rising",
    weeklyEvents: [12, 15, 19, 26],
    statusLine: "Enough data to report on all 5 members.",
    connectedSources: ["github", "google_docs", "google_meet"],
    unmatchedAccount: null,
    meetingsHeld: 6,
    lastCollected: "28 Aug",
    members: [],
  },
  {
    id: "swen30006",
    title: "SWEN30006 Project 2",
    status: "too_early",
    dueLabel: "due 15 Sep 2025",
    memberCount: 3,
    trend: "no_data",
    weeklyEvents: [],
    statusLine:
      "Started 3 days ago. GitHub is the only connected source, so document edits and attendance are not collected.",
    connectedSources: ["github"],
    unmatchedAccount: null,
    meetingsHeld: 0,
    lastCollected: "28 Aug",
    members: [],
  },
];
