"use client";

import type { Draft } from "./draft";
import { controlClass, describedBy, Field } from "./fields";

/**
 * Step 1. Only the two fields the project record actually holds: everything
 * shown here is written on the last step, so nothing is collected that has
 * nowhere to go.
 */
export function ProjectInfoStep({
  draft,
  errors,
  onChange,
  registerField,
}: {
  draft: Draft;
  errors: { title?: string; dueDate?: string; description?: string };
  onChange: (patch: Partial<Draft>) => void;
  registerField: (id: string) => (element: HTMLElement | null) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-subhead font-semibold text-ink-900">
          Project information
        </h2>
        <p className="text-body text-ink-500">
          Basic details about the project. You can change either of these later.
        </p>
      </div>

      <Field
        id="project-title"
        label="Project title"
        help="Everyone you invite sees this title when they join."
        error={errors.title}
      >
        <input
          ref={registerField("project-title")}
          id="project-title"
          name="projectTitle"
          type="text"
          required
          autoComplete="off"
          placeholder="e.g. COMP30022 Final Project"
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={describedBy("project-title", errors.title)}
          className={controlClass}
        />
      </Field>

      <div className="max-w-70">
        <Field
          id="due-date"
          label="Deadline"
          help="Reports cover today until this date."
          error={errors.dueDate}
        >
          <input
            ref={registerField("due-date")}
            id="due-date"
            name="dueDate"
            type="date"
            required
            value={draft.dueDate}
            onChange={(event) => onChange({ dueDate: event.target.value })}
            aria-invalid={errors.dueDate ? true : undefined}
            aria-describedby={describedBy("due-date", errors.dueDate)}
            className={controlClass}
          />
        </Field>
      </div>

      <Field
        id="project-description"
        label="Description"
        optional
        error={errors.description}
        help="What the project is, in your own words. It is shown to the group and read by nothing else."
      >
        <textarea
          ref={registerField("project-description")}
          id="project-description"
          name="projectDescription"
          rows={4}
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedBy("project-description", errors.description)}
          className={`${controlClass} min-h-24 resize-y py-2`}
        />
      </Field>
    </div>
  );
}
