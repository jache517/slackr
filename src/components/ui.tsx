import type { ReactNode } from "react";
import Link from "next/link";

import {
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  WarningIcon,
} from "@/components/icons";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "quiet";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-control font-semibold text-body transition-colors duration-[120ms] ease-out";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "min-h-9 px-4 bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
  secondary:
    "min-h-9 px-4 bg-surface-card text-ink-900 border border-ink-300 hover:bg-surface-page hover:border-ink-700",
  quiet:
    "min-h-8 px-4 border border-ink-300 text-ink-500 hover:bg-surface-page hover:text-ink-900",
};

export function Button({
  variant = "primary",
  children,
  className = "",
  disabledReason,
  ...rest
}: {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
  disabledReason?: string;
} & React.ComponentProps<"button">) {
  const blocked = Boolean(disabledReason);
  return (
    <button
      type="button"
      aria-disabled={blocked || undefined}
      className={`${buttonBase} ${buttonVariants[variant]} ${
        blocked
          ? "cursor-not-allowed bg-surface-track! text-ink-500! border! border-ink-300!"
          : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
}: {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${buttonVariants[variant]} no-underline ${className}`}
    >
      {children}
    </Link>
  );
}

/* ---------- Card ---------- */

export function Card({
  children,
  attention = false,
  className = "",
}: {
  children: ReactNode;
  attention?: boolean;
  className?: string;
}) {
  return (
    <section
      className={`rounded-card bg-surface-card p-6 ${
        attention ? "border border-amber-800" : "border border-rule"
      } ${className}`}
    >
      {children}
    </section>
  );
}

/* ---------- Page header ---------- */

export function MetaLine({ items }: { items: string[] }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-eyebrow font-semibold uppercase tracking-[0.06em] text-ink-500">
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-2">
          {index > 0 ? (
            <span
              aria-hidden
              className="inline-block size-[3px] rounded-full bg-ink-300"
            />
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

/** A fact about the page's subject, stated under the title with its glyph. */
export function FactLine({
  items,
}: {
  items: { icon: ReactNode; text: string }[];
}) {
  return (
    <p className="flex flex-wrap items-center gap-3 text-body text-ink-500">
      {items.map((item, index) => (
        <span key={item.text} className="flex items-center gap-2">
          {index > 0 ? (
            <span
              aria-hidden
              className="mr-1 inline-block size-[3px] rounded-full bg-ink-300"
            />
          ) : null}
          <span aria-hidden className="text-ink-500">
            {item.icon}
          </span>
          {item.text}
        </span>
      ))}
    </p>
  );
}

export function PageHeader({
  backLink,
  meta,
  title,
  badge,
  facts,
  actions,
}: {
  backLink?: { href: string; label: string };
  meta?: string[];
  title: string;
  /** Status shown beside the title, for pages whose subject has one. */
  badge?: ReactNode;
  /** Stated under the title, where `meta` sits above it. */
  facts?: { icon: ReactNode; text: string }[];
  actions?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[1fr_auto] items-end gap-x-8 border-b border-rule pb-6">
      <div className="flex min-w-0 flex-col gap-2">
        {backLink ? (
          <Link
            href={backLink.href}
            className="inline-flex w-fit items-center gap-2 rounded-control text-body font-medium text-indigo-600 no-underline hover:text-indigo-700 hover:underline underline-offset-2"
          >
            <ArrowLeftIcon size={16} />
            {backLink.label}
          </Link>
        ) : null}
        {meta ? <MetaLine items={meta} /> : null}
        <span className="flex flex-wrap items-center gap-3">
          <h1 className="text-display font-semibold text-ink-900">{title}</h1>
          {badge}
        </span>
        {facts ? <FactLine items={facts} /> : null}
      </div>
      {actions ? (
        <div className="flex items-end gap-3 self-end">{actions}</div>
      ) : null}
    </header>
  );
}

/* ---------- Badge ---------- */

export type BadgeTone = "ok" | "warn" | "early";

const badgeTones: Record<BadgeTone, string> = {
  ok: "bg-tint-green text-green-800",
  warn: "bg-tint-amber text-amber-800",
  early: "bg-surface-track text-ink-700",
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  const Glyph = tone === "ok" ? CheckIcon : tone === "warn" ? WarningIcon : ClockIcon;
  return (
    <span
      className={`inline-flex min-h-[22px] items-center gap-1 rounded-full px-2.5 text-eyebrow font-semibold uppercase tracking-[0.06em] whitespace-nowrap ${badgeTones[tone]}`}
    >
      <Glyph size={12} />
      {children}
    </span>
  );
}

/* ---------- Stat tile ---------- */

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-tile border border-rule bg-surface-card p-4">
      <b data-tabular className="text-stat font-semibold text-ink-900">
        {value}
      </b>
      <span className="text-body font-normal text-ink-500">{label}</span>
    </div>
  );
}

/* ---------- Bar ---------- */

export function Bar({
  percentOfTrack,
  tone = "indigo",
  showEvenSplit = false,
  evenSplitAt = 62.5,
}: {
  percentOfTrack: number;
  tone?: "indigo" | "amber";
  showEvenSplit?: boolean;
  evenSplitAt?: number;
}) {
  return (
    <div
      aria-hidden
      className="relative h-3.5 rounded-full bg-surface-track shadow-[inset_0_0_0_1px_var(--color-ink-300)]"
    >
      <div
        className={`h-3.5 rounded-full ${
          tone === "amber" ? "bg-amber-800" : "bg-indigo-600"
        }`}
        style={{ width: `${Math.min(percentOfTrack, 100)}%` }}
      />
      {showEvenSplit ? (
        <span
          className="absolute -top-1.5 -bottom-1.5 border-l border-dashed border-ink-700"
          style={{ left: `${evenSplitAt}%` }}
        />
      ) : null}
    </div>
  );
}
