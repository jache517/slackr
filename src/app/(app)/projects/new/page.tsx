import { NewProjectForm } from "./new-project-form";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "New project - Slackr" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader
        backLink={{ href: "/projects", label: "Back to Projects" }}
        title="What are we tracking?"
        qualifier="Two steps. You'll invite the group with a link at the end."
      />

      <nav aria-label="Progress" className="flex flex-col gap-2">
        <p className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
          Step 1 of 2
        </p>
        <ol className="flex list-none items-center gap-3 p-0">
          <li
            aria-current="step"
            className="flex items-center gap-2 text-body font-semibold text-indigo-600"
          >
            <span className="size-2 rounded-full bg-indigo-600 shadow-[0_0_0_2px_var(--color-indigo-600)]" />
            The project
          </li>
          <span aria-hidden className="h-px w-8 bg-ink-300" />
          <li className="flex items-center gap-2 text-body text-ink-500">
            <span className="size-2 rounded-full border-[1.5px] border-ink-300" />
            Connect the tools
          </li>
        </ol>
      </nav>

      <NewProjectForm />
    </>
  );
}
