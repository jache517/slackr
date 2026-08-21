import { Button, Card, PageHeader } from "@/components/ui";
import { COURSE_OPTIONS } from "@/lib/data/fixtures";

export const metadata = { title: "New project - Slackr" };

function Field({
  id,
  label,
  help,
  children,
}: {
  id: string;
  label: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline gap-2">
        <label htmlFor={id} className="text-body font-semibold text-ink-900">
          {label}
        </label>
        <span className="text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
          Required
        </span>
      </span>
      {children}
      <p id={`${id}-help`} className="text-body text-ink-500">
        {help}
      </p>
    </div>
  );
}

const controlClass =
  "min-h-10 w-full rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-900 transition-colors duration-[120ms] hover:border-ink-700";

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

      <div className="grid grid-cols-[1fr_380px] items-start gap-6">
        <Card>
          <form noValidate className="flex flex-col gap-6">
            <h2 className="text-subhead font-semibold text-ink-900">
              Project details
            </h2>

            <Field
              id="project-name"
              label="Project name"
              help="Students see this name when they join."
            >
              <input
                id="project-name"
                name="projectName"
                type="text"
                required
                autoComplete="off"
                aria-describedby="project-name-help"
                className={controlClass}
              />
            </Field>

            <Field
              id="course"
              label="Course"
              help="Reports are grouped by course."
            >
              <select
                id="course"
                name="course"
                required
                defaultValue=""
                aria-describedby="course-help"
                className={controlClass}
              >
                <option value="" disabled>
                  Choose a course
                </option>
                {COURSE_OPTIONS.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </Field>

            <div className="max-w-70">
              <Field
                id="due-date"
                label="Due date"
                help="Reports cover today until this date."
              >
                <input
                  id="due-date"
                  name="dueDate"
                  type="date"
                  required
                  aria-describedby="due-date-help"
                  className={controlClass}
                />
              </Field>
            </div>

            <hr className="border-0 border-t border-rule" />

            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <Button
                  disabledReason="Fill in all three fields to continue."
                  aria-describedby="next-reason"
                >
                  Next: connect the tools
                </Button>
                <Button variant="secondary" aria-describedby="cancel-note">
                  Cancel
                </Button>
              </div>
              <p id="next-reason" className="text-body text-ink-500">
                Fill in all three fields to continue.
              </p>
              <p id="cancel-note" className="text-body text-ink-500">
                Cancel discards this draft.
              </p>
            </div>
          </form>
        </Card>

        <Card>
          <div className="flex flex-col gap-4">
            <h2 className="text-subhead font-semibold text-ink-900">
              What you&apos;re creating
            </h2>
            <div className="flex flex-col gap-1">
              <p className="text-section font-semibold text-ink-500 italic">
                Not set yet
              </p>
            </div>
            <hr className="border-0 border-t border-rule" />
            <ul className="flex list-none flex-col gap-3 p-0">
              {[
                "No tools connected yet (step 2)",
                "Invite link is created at the end",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="size-4 shrink-0 rounded-full border-[1.5px] border-ink-300"
                  />
                  <span className="text-body text-ink-900">
                    <span className="mr-2 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
                      Not started
                    </span>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <hr className="border-0 border-t border-rule" />
            <p className="text-body text-ink-500">
              Nothing is collected until you connect at least one tool. You can
              change any of this later.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
