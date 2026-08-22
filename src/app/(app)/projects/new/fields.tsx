import type { ReactNode } from "react";

/**
 * The form primitives every New Project step shares.
 *
 * Required is the red asterisk readers already know from every other form.
 * The glyph is decorative and the word "required" sits beside it for screen
 * readers, so the requirement survives being read aloud.
 */

export const controlClass =
  "min-h-10 w-full rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-900 transition-colors duration-[120ms] hover:border-ink-700 aria-invalid:border-red-700";

export function Field({
  id,
  label,
  help,
  error,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-baseline gap-1.5">
        <label htmlFor={id} className="text-body font-semibold text-ink-900">
          {label}
        </label>
        {optional ? (
          <span className="text-body text-ink-500">(Optional)</span>
        ) : (
          <>
            <span aria-hidden className="text-body text-red-700">
              *
            </span>
            <span className="sr-only">required</span>
          </>
        )}
      </span>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-body text-red-700">
          {error}
        </p>
      ) : null}
      {help ? (
        <p id={`${id}-help`} className="text-body text-ink-500">
          {help}
        </p>
      ) : null}
    </div>
  );
}

/** Points a field's `aria-describedby` at whichever of the two notes is shown. */
export function describedBy(id: string, error?: string, hasHelp = true) {
  if (error) return `${id}-error`;
  return hasHelp ? `${id}-help` : undefined;
}
