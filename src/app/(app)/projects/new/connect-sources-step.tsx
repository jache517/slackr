"use client";

import type { Draft, SourceErrors } from "./draft";
import { controlClass, describedBy, Field } from "./fields";

/**
 * Step 3. Both sources are optional: a project with none is a project that
 * collects nothing yet, which is a legitimate place to start and reversible
 * from the project's Connections screen.
 *
 * The two are not symmetrical. A public repository can be read on the
 * project's behalf, so it is connected outright. Google Docs activity cannot
 * be read without the owner's consent, so that link is recorded here and the
 * consent is asked for once the project exists.
 */
export function ConnectSourcesStep({
  draft,
  errors,
  onChange,
  registerField,
}: {
  draft: Draft;
  errors: SourceErrors;
  onChange: (patch: Partial<Draft>) => void;
  registerField: (id: string) => (element: HTMLElement | null) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-subhead font-semibold text-ink-900">
          Connect sources
        </h2>
        <p className="text-body text-ink-500">
          Where the evidence comes from. Only what these tools already record
          in the open is collected: commits, and observable document edits,
          comments and suggestions. Nothing is read until the project is
          created.
        </p>
      </div>

      <Field
        id="github-url"
        label="GitHub repository"
        optional
        error={errors.githubUrl}
        help="A public repository. Its commits are matched to the GitHub usernames from step 2."
      >
        <input
          ref={registerField("github-url")}
          id="github-url"
          name="githubUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://github.com/owner/repository"
          value={draft.githubUrl}
          onChange={(event) => onChange({ githubUrl: event.target.value })}
          aria-invalid={errors.githubUrl ? true : undefined}
          aria-describedby={describedBy("github-url", errors.githubUrl)}
          className={controlClass}
        />
      </Field>

      <Field
        id="google-doc-url"
        label="Google Doc"
        optional
        error={errors.googleDocUrl}
        help="Saved with the project. Reading its activity needs your Google sign-in, which is asked for after the project is created."
      >
        <input
          ref={registerField("google-doc-url")}
          id="google-doc-url"
          name="googleDocUrl"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://docs.google.com/document/d/..."
          value={draft.googleDocUrl}
          onChange={(event) => onChange({ googleDocUrl: event.target.value })}
          aria-invalid={errors.googleDocUrl ? true : undefined}
          aria-describedby={describedBy("google-doc-url", errors.googleDocUrl)}
          className={controlClass}
        />
      </Field>

      <p className="rounded-control bg-tint-indigo px-3 py-2 text-body text-ink-700">
        You can skip both and connect them later. A report with no connected
        source has no evidence in it, and says so.
      </p>
    </div>
  );
}
