import "server-only";

import type {
  CanonicalEvidenceSnapshot,
  ContributionReportMember,
  ReportVisualisation,
} from "@/types/api";

import {
  buildAiGeneratedEvidenceReport,
  validateAiProviderDraft,
} from "./ai-report-validation";
import { createAiReportProvider } from "./openai-report-provider";

type AiProviderMemberInput = Pick<
  ContributionReportMember,
  "memberId" | "name" | "roleContext" | "evidence"
> & {
  context: Array<{
    contextText: string;
    submissionType: "memberSelfReported" | "projectOwnerRecorded";
    createdAt: string;
  }>;
};

export type AiProviderInput = {
  project: {
    title: string;
    deadline: string;
  };
  monitoringPeriod: CanonicalEvidenceSnapshot["monitoringPeriod"];
  sourceStates: Array<{
    sourceType: "github" | "googleDocs";
    status: "unconnected" | "connected" | "failed";
    isStale: boolean;
  }>;
  members: AiProviderMemberInput[];
  visualisationMetadata: Array<
    Pick<ReportVisualisation, "id" | "title" | "caption">
  >;
  limitations: string[];
};

export type AiProviderFailure =
  | "not_configured"
  | "unavailable"
  | "rate_limited"
  | "invalid_output";

export type AiProviderResult =
  | { ok: true; draft: unknown }
  | { ok: false; reason: AiProviderFailure };

export interface AiReportProvider {
  generate(input: AiProviderInput): Promise<AiProviderResult>;
}

export class UnconfiguredAiReportProvider implements AiReportProvider {
  async generate(): Promise<AiProviderResult> {
    return { ok: false, reason: "not_configured" };
  }
}

export type AiReportServiceResult =
  | {
      ok: true;
      report: ReturnType<typeof buildAiGeneratedEvidenceReport>;
    }
  | { ok: false; reason: AiProviderFailure };

export function buildAiProviderInput(
  snapshot: CanonicalEvidenceSnapshot,
): AiProviderInput {
  return {
    project: {
      title: snapshot.project.title,
      deadline: snapshot.project.deadline,
    },
    monitoringPeriod: { ...snapshot.monitoringPeriod },
    sourceStates: (["github", "googleDocs"] as const).map((sourceType) => {
      const state = snapshot.sourceStates[sourceType];

      return {
        sourceType,
        status: state.status,
        isStale: state.isStale,
      };
    }),
    members: snapshot.members.map((member) => ({
      memberId: member.memberId,
      name: member.name,
      roleContext: member.roleContext
        ? {
            ...member.roleContext,
            additionalRoles: [...member.roleContext.additionalRoles],
            responsibilities: [...member.roleContext.responsibilities],
          }
        : null,
      evidence: {
        github: member.evidence.github
          ? {
              ...member.evidence.github,
              items: member.evidence.github.items.map((item) => ({ ...item })),
            }
          : null,
        googleDocs: member.evidence.googleDocs
          ? {
              ...member.evidence.googleDocs,
              items: member.evidence.googleDocs.items.map((item) => ({ ...item })),
            }
          : null,
      },
      context: member.context.map(
        ({ contextText, submissionType, createdAt }) => ({
          contextText,
          submissionType,
          createdAt,
        }),
      ),
    })),
    visualisationMetadata: snapshot.visualisations.map(
      ({ id, title, caption }) => ({ id, title, caption }),
    ),
    limitations: [...snapshot.limitations],
  };
}

export async function generateAiEvidenceReport(
  snapshot: CanonicalEvidenceSnapshot,
  provider: AiReportProvider = createAiReportProvider(),
): Promise<AiReportServiceResult> {
  let providerResult: AiProviderResult;

  try {
    providerResult = await provider.generate(buildAiProviderInput(snapshot));
  } catch {
    return { ok: false, reason: "unavailable" };
  }

  if (!providerResult.ok) {
    return providerResult;
  }

  const validated = validateAiProviderDraft(providerResult.draft, snapshot);

  if (!validated.ok) {
    return { ok: false, reason: "invalid_output" };
  }

  return {
    ok: true,
    report: buildAiGeneratedEvidenceReport(snapshot, validated.draft),
  };
}
