import { redirect } from "next/navigation";

export default async function LegacyMemberReportPage({
  params,
}: PageProps<"/projects/[projectId]/report/[memberSlug]">) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/report`);
}
