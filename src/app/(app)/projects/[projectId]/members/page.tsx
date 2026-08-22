import { notFound } from "next/navigation";

import { getProject } from "@/lib/data/queries";
import { MembersScreen } from "./members-screen";

export default async function MembersPage({
  params,
  searchParams,
}: PageProps<"/projects/[projectId]/members">) {
  const { projectId } = await params;
  const query = await searchParams;
  const project = await getProject(projectId);
  if (!project) notFound();

  return (
    <MembersScreen
      projectId={projectId}
      title={project.title}
      members={project.members}
      unmatchedAccount={project.unmatchedAccount}
      initialEditMemberId={
        typeof query.memberId === "string" ? query.memberId : undefined
      }
    />
  );
}
