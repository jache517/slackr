import "server-only";

import { z } from "zod";

import type {
  AiGeneratedEvidenceReport,
  CanonicalEvidenceSnapshot,
  EvidenceReference,
  ReportVisualisation,
} from "@/types/api";

const evidenceReferenceSchema = z
  .string()
  .regex(
    /^(github:commit:.+|googleDocs:activity:.+)$/,
    "Evidence reference is invalid",
  );

const visualisationIdSchema = z.enum([
  "sourceActivityByMember",
  "activityTimeline",
  "sourceStates",
]);

// Keep the provider-facing schema within the Structured Outputs JSON Schema
// subset. The stricter runtime schema below remains the application boundary.
export const aiProviderStructuredOutputSchema = z.object({
  title: z.string(),
  overview: z.string(),
  sections: z.array(
    z.object({
      id: z.string(),
      heading: z.string(),
      body: z.string(),
      memberId: z.string().nullable(),
      evidenceRefs: z.array(z.string()),
    }),
  ),
  visualisations: z.array(
    z.object({
      id: visualisationIdSchema,
      title: z.string(),
      caption: z.string(),
    }),
  ),
  limitations: z.array(z.string()),
});

const providerDraftSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
  overview: z.string().trim().min(1).max(4000),
  sections: z
    .array(
      z.strictObject({
        id: z.string().trim().min(1).max(100),
        heading: z.string().trim().min(1).max(200),
        body: z.string().trim().min(1).max(4000),
        memberId: z.uuid().nullable(),
        evidenceRefs: z.array(evidenceReferenceSchema).max(50),
      }),
    )
    .max(50),
  visualisations: z
    .array(
      z.strictObject({
        id: visualisationIdSchema,
        title: z.string().trim().min(1).max(200),
        caption: z.string().trim().min(1).max(500),
      }),
    )
    .max(3),
  limitations: z
    .array(z.string().trim().min(1).max(1000))
    .max(50),
});

export type AiProviderDraft = z.output<typeof providerDraftSchema>;

const forbiddenReportLanguage = [
  /\bfree[- ]rider\b/i,
  /\b(rank|ranking|ranked)\b/i,
  /\b(score|scored|scoring)\b/i,
  /\bgrade recommendation\b/i,
  /\bdisciplinary action\b/i,
  /\b(high|low) contribution\b/i,
  /\bcontributed more\b/i,
  /\bcontributed less\b/i,
  /\boverall contribution\b/i,
  /\bcontribution percentage\b/i,
];

export type AiReportValidationResult =
  | { ok: true; draft: AiProviderDraft }
  | {
      ok: false;
      reason:
        | "invalid_schema"
        | "unknown_member"
        | "unknown_evidence_reference"
        | "invalid_visualisation_selection";
    };

function allEvidenceReferences(snapshot: CanonicalEvidenceSnapshot) {
  const references = new Set<EvidenceReference>();

  for (const member of snapshot.members) {
    for (const item of member.evidence.github?.items ?? []) {
      references.add(item.evidenceRef);
    }

    for (const item of member.evidence.googleDocs?.items ?? []) {
      references.add(item.evidenceRef);
    }
  }

  return references;
}

function memberIds(snapshot: CanonicalEvidenceSnapshot) {
  return new Set(snapshot.members.map((member) => member.memberId));
}

function evidenceOwnerByReference(snapshot: CanonicalEvidenceSnapshot) {
  const owners = new Map<EvidenceReference, string>();

  for (const member of snapshot.members) {
    for (const item of member.evidence.github?.items ?? []) {
      owners.set(item.evidenceRef, member.memberId);
    }

    for (const item of member.evidence.googleDocs?.items ?? []) {
      owners.set(item.evidenceRef, member.memberId);
    }
  }

  return owners;
}

function containsForbiddenReportLanguage(value: string) {
  return forbiddenReportLanguage.some((pattern) => pattern.test(value));
}

export function validateAiProviderDraft(
  value: unknown,
  snapshot: CanonicalEvidenceSnapshot,
): AiReportValidationResult {
  const parsed = providerDraftSchema.safeParse(value);

  if (!parsed.success) {
    return { ok: false, reason: "invalid_schema" };
  }

  const members = memberIds(snapshot);
  const references = allEvidenceReferences(snapshot);
  const evidenceOwners = evidenceOwnerByReference(snapshot);
  const sectionIds = new Set<string>();
  const visualisationIds = new Set<string>();

  if (
    containsForbiddenReportLanguage(parsed.data.title) ||
    containsForbiddenReportLanguage(parsed.data.overview) ||
    parsed.data.sections.some(
      (section) =>
        containsForbiddenReportLanguage(section.heading) ||
        containsForbiddenReportLanguage(section.body),
    ) ||
    parsed.data.visualisations.some(
      (visualisation) =>
        containsForbiddenReportLanguage(visualisation.title) ||
        containsForbiddenReportLanguage(visualisation.caption),
    ) ||
    parsed.data.limitations.some(containsForbiddenReportLanguage)
  ) {
    return { ok: false, reason: "invalid_schema" };
  }

  for (const section of parsed.data.sections) {
    if (sectionIds.has(section.id)) {
      return { ok: false, reason: "invalid_schema" };
    }

    sectionIds.add(section.id);

    if (section.memberId && !members.has(section.memberId)) {
      return { ok: false, reason: "unknown_member" };
    }

    if (
      section.evidenceRefs.some(
        (reference) => !references.has(reference as EvidenceReference),
      )
    ) {
      return { ok: false, reason: "unknown_evidence_reference" };
    }

    if (section.memberId && section.evidenceRefs.length === 0) {
      return { ok: false, reason: "unknown_evidence_reference" };
    }

    if (
      section.memberId &&
      section.evidenceRefs.some(
        (reference) =>
          evidenceOwners.get(reference as EvidenceReference) !== section.memberId,
      )
    ) {
      return { ok: false, reason: "unknown_evidence_reference" };
    }
  }

  const supportedVisualisationIds = new Set(
    snapshot.visualisations.map((visualisation) => visualisation.id),
  );

  for (const visualisation of parsed.data.visualisations) {
    if (visualisationIds.has(visualisation.id)) {
      return { ok: false, reason: "invalid_schema" };
    }

    visualisationIds.add(visualisation.id);

    if (!supportedVisualisationIds.has(visualisation.id)) {
      return { ok: false, reason: "invalid_visualisation_selection" };
    }
  }

  return { ok: true, draft: parsed.data };
}

export function buildAiGeneratedEvidenceReport(
  snapshot: CanonicalEvidenceSnapshot,
  draft: AiProviderDraft,
): AiGeneratedEvidenceReport {
  const metadataById = new Map(
    draft.visualisations.map((visualisation) => [
      visualisation.id,
      visualisation,
    ]),
  );

  const visualisations = snapshot.visualisations.map((visualisation) => {
    const metadata = metadataById.get(visualisation.id);

    if (!metadata) {
      return visualisation;
    }

    return {
      ...visualisation,
      title: metadata.title,
      caption: metadata.caption,
    } as ReportVisualisation;
  });

  return {
    generatedAt: new Date().toISOString(),
    monitoringPeriod: snapshot.monitoringPeriod,
    title: draft.title,
    overview: draft.overview,
    sections: draft.sections.map((section) => ({
      ...section,
      evidenceRefs: section.evidenceRefs as EvidenceReference[],
    })),
    visualisations,
    limitations: [
      ...snapshot.limitations,
      ...draft.limitations.filter(
        (limitation) => !snapshot.limitations.includes(limitation),
      ),
    ],
    disclaimer: snapshot.disclaimer,
    reviewRequired: true,
  };
}
