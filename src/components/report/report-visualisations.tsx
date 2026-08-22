import type { ReportVisualisation } from "@/types/api";

function formatTimestamp(timestamp: string) {
  return `${new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(timestamp))} UTC`;
}

export function ReportVisualisations({
  visualisations,
}: {
  visualisations: ReportVisualisation[];
}) {
  return (
    <section aria-labelledby="report-visualisations-heading">
      <h2
        id="report-visualisations-heading"
        className="text-subhead font-semibold text-ink-900"
      >
        Evidence visualisations
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {visualisations.map((visualisation) => (
          <div
            key={visualisation.id}
            className="rounded-tile border border-rule bg-surface-card p-5"
          >
            <h3 className="text-section font-semibold text-ink-900">
              {visualisation.title}
            </h3>
            <p className="mt-1 text-body text-ink-500">
              {visualisation.caption}
            </p>

            {visualisation.type === "groupedBar" ? (
              <>
                <div className="mt-4 flex flex-col gap-4" aria-hidden="true">
                  {visualisation.series.map((item, index) => {
                    const max = Math.max(
                      1,
                      ...visualisation.series
                        .filter((candidate) => candidate.metric === item.metric)
                        .map((candidate) => candidate.value),
                    );
                    const width = `${Math.round((item.value / max) * 100)}%`;

                    return (
                      <div
                        key={`${item.sourceType}-${item.metric}-${item.label}-${index}`}
                        className="flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-3 text-eyebrow text-ink-500">
                          <span className="truncate">{item.label}</span>
                          <span className="shrink-0">
                            {item.sourceType === "github"
                              ? "GitHub commits"
                              : "Google Docs activity"}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-surface-track">
                          <div
                            className={`h-3 rounded-full ${
                              item.sourceType === "github"
                                ? "bg-indigo-600"
                                : "bg-green-700"
                            }`}
                            style={{ width }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <table className="mt-4 w-full border-collapse">
                  <caption className="sr-only">{visualisation.title}</caption>
                  <thead>
                    <tr>
                      <th className="border-b border-ink-300 pb-2 text-left text-eyebrow uppercase tracking-[0.06em] text-ink-500">
                        Member
                      </th>
                      <th className="border-b border-ink-300 pb-2 text-left text-eyebrow uppercase tracking-[0.06em] text-ink-500">
                        Source
                      </th>
                      <th className="border-b border-ink-300 pb-2 text-right text-eyebrow uppercase tracking-[0.06em] text-ink-500">
                        Recorded
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visualisation.series.map((item, index) => (
                      <tr
                        key={`${item.sourceType}-${item.metric}-${item.label}-${index}`}
                      >
                        <th className="border-b border-rule py-2 text-left text-body font-medium text-ink-900">
                          {item.label}
                        </th>
                        <td className="border-b border-rule py-2 text-body text-ink-500">
                          {item.sourceType === "github"
                            ? "GitHub commits"
                            : "Google Docs activity"}
                        </td>
                        <td className="border-b border-rule py-2 text-right text-body text-ink-900">
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : null}

            {visualisation.type === "timeline" ? (
              <ol className="mt-4 divide-y divide-rule">
                {visualisation.items.map((item) => (
                  <li
                    key={item.evidenceRef}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="text-body font-medium text-ink-900">
                        {item.memberName}
                      </p>
                      <p className="text-body text-ink-500">
                        {item.sourceType === "github"
                          ? "GitHub commit"
                          : `Google Docs ${item.activityType}`}
                      </p>
                      <p className="mt-1 text-eyebrow text-ink-500">
                        Evidence reference: {item.evidenceRef}
                      </p>
                    </div>
                    <time
                      dateTime={item.timestamp}
                      className="shrink-0 text-body text-ink-500"
                    >
                      {formatTimestamp(item.timestamp)}
                    </time>
                  </li>
                ))}
              </ol>
            ) : null}

            {visualisation.type === "sourceState" ? (
              <table className="mt-4 w-full border-collapse">
                <caption className="sr-only">{visualisation.title}</caption>
                <thead>
                  <tr>
                    <th className="border-b border-ink-300 pb-2 text-left text-eyebrow uppercase tracking-[0.06em] text-ink-500">
                      Source
                    </th>
                    <th className="border-b border-ink-300 pb-2 text-left text-eyebrow uppercase tracking-[0.06em] text-ink-500">
                      State
                    </th>
                    <th className="border-b border-ink-300 pb-2 text-left text-eyebrow uppercase tracking-[0.06em] text-ink-500">
                      Evidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visualisation.sources.map((source) => (
                    <tr key={source.sourceType}>
                      <th className="border-b border-rule py-2 text-left text-body font-medium text-ink-900">
                        {source.sourceType === "github"
                          ? "GitHub"
                          : "Google Docs"}
                      </th>
                      <td className="border-b border-rule py-2 text-body text-ink-500">
                        {source.status}
                      </td>
                      <td className="border-b border-rule py-2 text-body text-ink-500">
                        {source.status === "failed"
                          ? source.isStale
                            ? "stale retained evidence"
                            : "no retained evidence"
                          : source.status === "connected"
                            ? "current evidence"
                            : "no connected evidence"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
