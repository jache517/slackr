"use client";

import { useState } from "react";

import type { ReportVisualisation } from "@/types/api";

type TimelineVisualisation = Extract<ReportVisualisation, { type: "timeline" }>;

const INITIAL_COUNT = 5;

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
 * The individual events behind the totals, newest first.
 *
 * Only the most recent handful are worth the room by default: this is where a
 * reader checks a figure against something specific, not a log they read end
 * to end. The rest stay one press away rather than pushing everything below
 * them off the page.
 */
export function ActivityTimeline({
  visualisation,
}: {
  visualisation: TimelineVisualisation;
}) {
  const [expanded, setExpanded] = useState(false);

  if (visualisation.items.length === 0) return null;

  // The snapshot orders oldest first; the newest events are the useful ones.
  const newestFirst = [...visualisation.items].reverse();
  const shown = expanded ? newestFirst : newestFirst.slice(0, INITIAL_COUNT);
  const hidden = newestFirst.length - shown.length;

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex list-none flex-col gap-0 p-0">
        {shown.map((item) => (
          <li
            key={item.evidenceRef}
            className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5 last:border-b-0"
          >
            <span className="flex min-w-0 items-baseline gap-3">
              <span className="truncate text-body font-medium text-ink-900">
                {item.memberName}
              </span>
              <span className="truncate text-body text-ink-500">
                {describe(item)}
              </span>
            </span>

            <time
              dateTime={item.timestamp}
              data-tabular
              className="shrink-0 text-body whitespace-nowrap text-ink-500"
            >
              {formatMoment(item.timestamp)}
            </time>
          </li>
        ))}
      </ol>

      {hidden > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="self-start text-body font-semibold text-indigo-600 hover:text-indigo-700 hover:underline hover:underline-offset-2"
        >
          {expanded ? "Show less" : `Show ${hidden} more`}
        </button>
      ) : null}
    </div>
  );
}
