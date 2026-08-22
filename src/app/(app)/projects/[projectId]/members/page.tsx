import { notFound } from "next/navigation";

import { getProject } from "@/lib/data/queries";
import { MembersScreen } from "./members-screen";

export default async function MembersPage({
  params,
}: PageProps<"/projects/[projectId]/members">) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  return (
    <MembersScreen
      title={project.title}
      members={project.members}
      unmatchedAccount={project.unmatchedAccount}
    />
  );
}
