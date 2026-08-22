import type { ReportVisualisation } from "@/types/api";

type TimelineVisualisation = Extract<ReportVisualisation, { type: "timeline" }>;

function formatMoment(timestamp: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function describe(item: TimelineVisualisation["items"][number]) {
  return item.sourceType === "github"
    ? "GitHub commit"
    : `Google Docs ${item.activityType}`;
}

/**
 * The individual events behind the totals.
 *
 * This is the one place a reader can check a figure against something
 * specific, so each row keeps its evidence reference. The totals themselves
 * live in the evidence table and are not repeated here.
 */
export function ActivityTimeline({
  visualisation,
}: {
  visualisation: TimelineVisualisation;
}) {
  if (visualisation.items.length === 0) return null;

  return (
    <ol className="flex list-none flex-col gap-0 p-0">
      {visualisation.items.map((item) => (
        <li
          key={item.evidenceRef}
          className="grid grid-cols-[minmax(0,1fr)_10rem_9rem] items-baseline gap-4 border-b border-rule py-2.5 last:border-b-0"
        >
          <span className="truncate text-body font-medium text-ink-900">
            {item.memberName}
          </span>
          <span className="truncate text-body text-ink-500">
            {describe(item)}
          </span>
          <time
            dateTime={item.timestamp}
            data-tabular
            className="text-body text-ink-500"
          >
            {formatMoment(item.timestamp)}
          </time>
        </li>
      ))}
    </ol>
  );
}
