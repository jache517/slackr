import { notFound } from "next/navigation";

import {
  ConnectionsIcon,
  GithubMark,
  GoogleDocsMark,
  GoogleMeetMark,
  MembersIcon,
} from "@/components/icons";
import { Badge, ButtonLink, Card, PageHeader } from "@/components/ui";
import { getProject } from "@/lib/data/queries";
import type { SourceKey } from "@/lib/data/types";

export default async function ProjectSourcesPage({
  params,
}: PageProps<"/projects/[projectId]/sources">) {
  const { projectId } = await params;
  const project = await getProject(projectId);

  if (!project) notFound();

  const connected = project.sources.filter((source) => source.connected).length;

  return (
    <>
      <PageHeader
        backLink={{ href: `/projects/${project.id}`, label: "Back to Dashboard" }}
        meta={[project.title, `${connected} of ${project.sources.length} connected`]}
        title="Sources"
        facts={[
          {
            icon: <MembersIcon size={16} />,
            text: `${project.memberCount} members`,
          },
          {
            icon: <ConnectionsIcon size={16} />,
            text: `${connected} source${connected === 1 ? "" : "s"} connected`,
          },
        ]}
        actions={
          <ButtonLink href={`/projects/${project.id}/members`} variant="secondary">
            <MembersIcon size={18} />
            Members
          </ButtonLink>
        }
      />

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-subhead font-semibold text-ink-900">
              Project sources
            </h2>
            <Badge tone={connected === project.sources.length ? "ok" : "warn"}>
              {connected === project.sources.length ? "Ready" : "Needs setup"}
            </Badge>
          </div>

          <ul className="flex list-none flex-col p-0">
            {project.sources.map((source, index) => (
              <SourceRow
                key={source.key}
                source={source}
                last={index === project.sources.length - 1}
              />
            ))}
          </ul>
        </div>
      </Card>
    </>
  );
}

const SOURCE_MARKS: Record<SourceKey, React.ComponentType<{ size?: number }>> = {
  github: GithubMark,
  google_docs: GoogleDocsMark,
  google_meet: GoogleMeetMark,
};

function SourceRow({
  source,
  last,
}: {
  source: {
    key: SourceKey;
    label: string;
    connected: boolean;
    displayName: string | null;
    externalId: string | null;
    url: string | null;
    lastSyncLabel: string | null;
  };
  last: boolean;
}) {
  const Mark = SOURCE_MARKS[source.key];
  const detail = source.connected
    ? source.displayName ?? "Connected"
    : "Not connected";

  return (
    <li
      className={`grid grid-cols-[36px_minmax(0,1fr)_140px] items-center gap-4 py-4 ${
        last ? "pb-0" : "border-b border-rule"
      }`}
    >
      <span className="flex size-9 items-center justify-center">
        <Mark size={22} />
      </span>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-body font-medium text-ink-900">{source.label}</span>
        <span className="min-w-0 truncate text-body text-ink-500">{detail}</span>
      </div>

      <span className="justify-self-start">
        <Badge tone={source.connected ? "ok" : "warn"}>
          {source.connected ? "Connected" : "Not connected"}
        </Badge>
      </span>
    </li>
  );
}
