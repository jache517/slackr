"use client";

import { useId, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/components/icons";

const control =
  "min-h-10 w-full rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-900 transition-colors duration-[120ms] hover:border-ink-700 aria-invalid:border-red-700";

const labelClass = "text-body font-semibold text-ink-900";

/** A labelled text input with optional hint and field-level error. */
export function TextField({
  label,
  hint,
  error,
  className = "",
  id,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
} & React.ComponentProps<"input">) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={fieldId} className={labelClass}>
        {label}
      </label>

      <input
        {...rest}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={control}
      />

      {hint ? (
        <p id={hintId} className="text-body text-ink-500">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-body text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * A password input with a reveal toggle.
 *
 * The toggle is a button rather than a checkbox so screen readers announce it
 * as pressed or not, and it never submits the form it sits inside.
 */
export function PasswordField({
  label,
  hint,
  error,
  action,
  id,
  ...rest
}: {
  label: string;
  hint?: string;
  error?: string;
  /** Rendered beside the label, for "Forgot password?". */
  action?: React.ReactNode;
} & React.ComponentProps<"input">) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const [revealed, setRevealed] = useState(false);

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={fieldId} className={labelClass}>
          {label}
        </label>
        {action}
      </div>

      <div className="relative">
        <input
          {...rest}
          id={fieldId}
          type={revealed ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${control} pr-11`}
        />

        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          aria-pressed={revealed}
          aria-controls={fieldId}
          aria-label={revealed ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-control text-ink-500 transition-colors duration-[120ms] hover:text-ink-900"
        >
          {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      </div>

      {hint ? (
        <p id={hintId} className="text-body text-ink-500">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-body text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
