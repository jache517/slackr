import { NewProjectForm } from "./new-project-form";
import { Stepper } from "./stepper";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "New project - Slackr" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        backLink={{ href: "/projects", label: "Back to Projects" }}
        title="Create new project"
        qualifier="Four steps: the project, who is in it, where the evidence comes from, then a look over it before anything is created."
      />

      <Stepper current={0} />

      <NewProjectForm />
    </>
  );
}
