export type { ApiError, ApiSuccess } from "@/lib/api/response";

export type SourceType = "github" | "googleDocs" | "googleMeet";
export type DocsActivityType = "edit" | "comment" | "suggestion";
export type ContextSubmissionType =
  | "memberSelfReported"
  | "projectOwnerRecorded";

export type Project = {
  id: string;
  title: string;
  deadline: string;
  description: string | null;
  memberCount: number;
  connectedSourceCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProjectRequest = Pick<Project, "title" | "deadline"> &
  Partial<Pick<Project, "description">>;

export type UpdateProjectRequest = Partial<CreateProjectRequest>;

export type MemberRoleContext = {
  memberId: string;
  primaryRole: string;
  additionalRoles: string[];
  responsibilities: string[];
  additionalContext: string | null;
  submissionType: ContextSubmissionType;
  submittedByUserId: string;
  updatedAt: string;
};

export type ReportRoleContext = Omit<
  MemberRoleContext,
  "submittedByUserId"
>;

export type Member = {
  id: string;
  projectId: string;
  name: string;
  email: string | null;
  githubUsername: string | null;
  googleEmail: string | null;
  roleContext: MemberRoleContext | null;
};

export type CreateMemberRequest = Pick<Member, "name"> &
  Partial<Pick<Member, "email" | "githubUsername" | "googleEmail">>;

export type UpdateMemberRequest = Partial<
  Pick<Member, "name" | "email" | "githubUsername" | "googleEmail">
>;

export type UpdateMemberRoleContextRequest = Pick<
  MemberRoleContext,
  | "primaryRole"
  | "additionalRoles"
  | "responsibilities"
  | "additionalContext"
>;

export type SourceConnection<
  TSourceType extends SourceType = SourceType,
> = {
  id: string;
  projectId: string;
  sourceType: TSourceType;
  externalId: string;
  displayName: string;
  connectedAt: string;
  lastSyncedAt: string | null;
};

export type SourceProviderError = {
  code: string;
  message: string;
};

export type SourceState<TSourceType extends SourceType = SourceType> =
  | {
      sourceType: TSourceType;
      status: "unconnected";
      connection: null;
      isStale: false;
      error: null;
    }
  | {
      sourceType: TSourceType;
      status: "connected";
      connection: SourceConnection<TSourceType>;
      isStale: false;
      error: null;
    }
  | {
      sourceType: TSourceType;
      status: "failed";
      connection: SourceConnection<TSourceType>;
      isStale: boolean;
      error: SourceProviderError;
    };

export type SourceStates = {
  [TSourceType in SourceType]: SourceState<TSourceType>;
};

export type ProjectDetail = {
  project: Project;
  members: Member[];
  sourceConnections: SourceConnection[];
};

export type ConnectGithubSourceRequest = {
  repositoryUrl: string;
};

export type ConnectGoogleDocsSourceRequest = {
  documentUrl: string;
};

export type GoogleAuthorizationResponse = {
  authorizationUrl: string;
};

export type GithubActivitySummary = {
  commitCount: number;
  lastActiveAt: string | null;
};

export type GoogleDocsActivitySummary = {
  activityCount: number;
  editCount: number;
  commentCount: number;
  suggestionCount: number;
  lastActiveAt: string | null;
};

export type EvidenceAlert = {
  code: string;
  level: "attention";
  message: string;
  sourceTypes: SourceType[];
};

export type ActivityMemberSummary = {
  memberId: string;
  name: string;
  lastActiveAt: string | null;
  github: GithubActivitySummary | null;
  googleDocs: GoogleDocsActivitySummary | null;
  evidenceAlerts: EvidenceAlert[];
};

export type ProjectActivity = {
  projectId: string;
  generatedAt: string;
  sourceStates: SourceStates;
  members: ActivityMemberSummary[];
};

export type MemberContext = {
  id: string;
  projectId: string;
  memberId: string;
  contextText: string;
  submittedByUserId: string;
  submissionType: ContextSubmissionType;
  createdAt: string;
};

export type CreateMemberContextRequest = Pick<
  MemberContext,
  "memberId" | "contextText"
>;

export type GithubEvidenceReference = `github:commit:${string}`;
export type GoogleDocsEvidenceReference = `googleDocs:activity:${string}`;
export type EvidenceReference =
  | GithubEvidenceReference
  | GoogleDocsEvidenceReference;

export type GithubReportEvidenceItem = {
  evidenceRef: GithubEvidenceReference;
  sha: string;
  message: string;
  timestamp: string;
};

export type GithubReportEvidence = {
  commitCount: number;
  lastActiveAt: string | null;
  items: GithubReportEvidenceItem[];
};

export type GoogleDocsReportEvidenceItem = {
  evidenceRef: GoogleDocsEvidenceReference;
  id: string;
  activityType: DocsActivityType;
  timestamp: string;
};

export type GoogleDocsReportEvidence = {
  activityCount: number;
  editCount: number;
  commentCount: number;
  suggestionCount: number;
  lastActiveAt: string | null;
  items: GoogleDocsReportEvidenceItem[];
};

export type ReportMemberContext = Omit<
  MemberContext,
  "projectId" | "memberId" | "submittedByUserId"
>;

export type ContributionReportMember = {
  memberId: string;
  name: string;
  roleContext: ReportRoleContext | null;
  evidence: {
    github: GithubReportEvidence | null;
    googleDocs: GoogleDocsReportEvidence | null;
  };
  context: ReportMemberContext[];
};

export type ContributionReport = {
  project: Project;
  monitoringPeriod: {
    from: string;
    to: string;
  };
  generatedAt: string;
  connectedSources: SourceConnection[];
  sourceStates: SourceStates;
  members: ContributionReportMember[];
  disclaimer: string;
};

export type AiEvidenceSummary = {
  generatedAt: string;
  overview: string;
  memberObservations: Array<{
    memberId: string;
    roleContextUsed: boolean;
    observations: Array<{
      text: string;
      evidenceRefs: EvidenceReference[];
    }>;
    missingContext: string[];
  }>;
  limitations: string[];
  disclaimer: string;
  reviewRequired: true;
};
