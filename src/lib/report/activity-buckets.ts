/**
 * Recorded events spread across the monitoring period.
 *
 * A total says how much someone did; it cannot say whether they did it
 * steadily or in one night before the deadline. These buckets carry that,
 * and they are built from the same event list the total counts, so the two
 * can never disagree.
 */

const DAY_MS = 86_400_000;
const MIN_BUCKETS = 4;
const MAX_BUCKETS = 12;

/** One bucket per week, kept within a range that stays readable at this size. */
export function bucketCount(from: string, to: string) {
  const days = Math.max(1, Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS));

  return Math.min(MAX_BUCKETS, Math.max(MIN_BUCKETS, Math.ceil(days / 7)));
}

/**
 * Counts per bucket. Timestamps outside the period are clamped into the end
 * buckets rather than dropped, so every counted event is represented.
 */
export function bucketTimestamps(
  timestamps: readonly string[],
  from: string,
  to: string,
  buckets: number,
) {
  const start = Date.parse(from);
  // The end date names a whole day, so the period runs to the end of it.
  const end = Date.parse(to) + DAY_MS;
  const span = Math.max(1, end - start);
  const counts = new Array<number>(buckets).fill(0);

  for (const timestamp of timestamps) {
    const at = Date.parse(timestamp);

    if (Number.isNaN(at)) continue;

    const raw = Math.floor(((at - start) / span) * buckets);
    counts[Math.min(buckets - 1, Math.max(0, raw))] += 1;
  }

  return counts;
}
