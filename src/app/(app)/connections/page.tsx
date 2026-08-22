import Link from "next/link";

import { CheckIcon, WarningIcon } from "@/components/icons";
import { Card, PageHeader } from "@/components/ui";
import { SOURCE_LABELS, listProjects, type SourceKey } from "@/lib/data/queries";

export const metadata = { title: "Connections - Slackr" };

const ALL_SOURCES: SourceKey[] = ["github", "google_docs", "google_meet"];

/**
 * What each project is collecting from, and what it is missing.
 *
 * A disconnected source is not a neutral gap: it silently zeroes that whole
 * measure for every member, so it reads as a warning rather than an absence.
 */
export default async function ConnectionsPage() {
  const projects = await listProjects();

  const missing = projects.reduce(
    (count, project) => count + (ALL_SOURCES.length - project.connectedSources.length),
    0,
  );

  return (
    <>
      <PageHeader
        meta={[
          `${projects.length} project${projects.length === 1 ? "" : "s"}`,
          `${projects.length * ALL_SOURCES.length - missing} of ${projects.length * ALL_SOURCES.length} sources connected`,
        ]}
        title={
          missing === 0
            ? "Every source is connected."
            : `${missing} source${missing === 1 ? " is" : "s are"} not connected.`
        }
        qualifier="An unconnected source records nothing, for everyone, silently."
      />

      {projects.length === 0 ? (
        <Card>
          <p className="text-body text-ink-500">
            No projects yet. Connections appear here once you create one.
          </p>
        </Card>
      ) : null}

      {projects.map((project) => (
        <Card key={project.id}>
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-subhead font-semibold text-ink-900">
                <Link
                  href={`/projects/${project.id}`}
                  className="text-indigo-600 no-underline hover:underline underline-offset-2"
                >
                  {project.title}
                </Link>
              </h2>
              <p className="text-body text-ink-500">
                Last collected {project.lastCollected}
              </p>
            </div>

            <ul className="flex list-none flex-col p-0">
              {ALL_SOURCES.map((source, index) => {
                const connected = project.connectedSources.includes(source);
                const last = index === ALL_SOURCES.length - 1;

                return (
                  <li
                    key={source}
                    className={`flex items-center gap-4 py-4 ${
                      last ? "" : "border-b border-rule"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex size-5 shrink-0 items-center justify-center ${
                        connected ? "text-green-800" : "text-amber-800"
                      }`}
                    >
                      {connected ? <CheckIcon size={18} /> : <WarningIcon size={18} />}
                    </span>
                    <span className="w-55 shrink-0 text-body font-semibold text-ink-900">
                      {SOURCE_LABELS[source]}
                    </span>
                    <span
                      className={`flex-1 text-body ${
                        connected ? "text-ink-500" : "text-amber-800"
                      }`}
                    >
                      {connected
                        ? `Connected. ${
                            source === "google_meet"
                              ? `${project.meetingsHeld} meetings collected.`
                              : "Collecting normally."
                          }`
                        : `Not connected. ${SOURCE_LABELS[source]} data is blank for all ${project.memberCount} members.`}
                    </span>
                    <span className="shrink-0 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                      {connected ? "Done" : "Blocked"}
                    </span>
                  </li>
                );
              })}
            </ul>

            {project.unmatchedAccount ? (
              <div className="flex items-start gap-3 rounded-card bg-tint-amber px-5 py-4">
                <span aria-hidden className="mt-0.5 shrink-0 text-amber-800">
                  <WarningIcon size={18} />
                </span>
                <p className="text-body text-amber-800">
                  1 GitHub account, {project.unmatchedAccount.handle}, is matched
                  to nobody. Its {project.unmatchedAccount.commits} commits are
                  left out.{" "}
                  <Link
                    href={`/projects/${project.id}/members`}
                    className="font-semibold text-amber-800 underline underline-offset-2"
                  >
                    Match it on Members
                  </Link>
                </p>
              </div>
            ) : null}
          </div>
        </Card>
      ))}
    </>
  );
}
