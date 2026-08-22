"use client";

import { useId, useState, type ReactNode } from "react";

import { ChevronDownIcon } from "@/components/icons";

/**
 * Progressive disclosure. The panel uses the `hidden` attribute so it leaves
 * the accessibility tree when closed, and the chevron rotates on open.
 */
export function Disclosure({
  showLabel,
  hideLabel,
  children,
}: {
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
}) {
  const panelId = useId();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-8 items-center gap-2 rounded-control border border-ink-300 px-4 text-body font-semibold text-ink-500 transition-colors duration-[120ms] ease-out hover:bg-surface-page hover:text-ink-900"
      >
        <ChevronDownIcon
          size={16}
          className={`transition-transform duration-[160ms] ease-out ${
            open ? "rotate-180" : ""
          }`}
        />
        {open ? hideLabel : showLabel}
      </button>
      <div id={panelId} hidden={!open} className="mt-4">
        {children}
      </div>
    </>
  );
}
