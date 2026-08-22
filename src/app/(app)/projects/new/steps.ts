/**
 * The four steps of New Project, in order. The index into this array is the
 * wizard's whole notion of "where am I", so the labels, the progress
 * indicator and the `Next:` button copy cannot drift apart.
 */

export const STEPS = [
  { id: "info", label: "Project info", heading: "Project information" },
  { id: "members", label: "Members", heading: "Members" },
  { id: "sources", label: "Connect sources", heading: "Connect sources" },
  { id: "review", label: "Review", heading: "Review" },
] as const;

export type StepIndex = 0 | 1 | 2 | 3;

export const LAST_STEP: StepIndex = 3;
