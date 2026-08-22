import { PageHeader } from "@/components/ui";

import { NewProjectWizard } from "./new-project-wizard";

export const metadata = { title: "New project - Slackr" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        backLink={{ href: "/projects", label: "Back to Projects" }}
        title="Create new project"
      />

      <NewProjectWizard />
    </>
  );
}
