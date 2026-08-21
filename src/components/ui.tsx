import type { ReactNode } from "react";
import Link from "next/link";

import { CheckIcon, ClockIcon, WarningIcon } from "@/components/icons";
import type { TrendDirection } from "@/lib/data/fixtures";

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
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
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

export function PageHeader({
  backLink,
  meta,
  title,
  qualifier,
  actions,
}: {
  backLink?: { href: string; label: string };
  meta?: string[];
  title: string;
  qualifier?: string;
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
            {backLink.label}
          </Link>
        ) : null}
        {meta ? <MetaLine items={meta} /> : null}
        <h1 className="font-serif text-display text-ink-900">{title}</h1>
        {qualifier ? (
          <p className="max-w-160 text-body text-ink-500">{qualifier}</p>
        ) : null}
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

/* ---------- Sparkline ---------- */

const trendStroke: Record<TrendDirection, string> = {
  rising: "var(--color-indigo-600)",
  steady: "var(--color-ink-700)",
  declining: "var(--color-amber-800)",
  no_data: "var(--color-ink-700)",
};

export const trendWord: Record<TrendDirection, string> = {
  rising: "Rising",
  steady: "Steady",
  declining: "Declining",
  no_data: "Not enough data",
};

export function Sparkline({
  points,
  trend,
  title,
  width = 64,
  height = 20,
}: {
  points: number[];
  trend: TrendDirection;
  title: string;
  width?: number;
  height?: number;
}) {
  if (trend === "no_data" || points.length < 2) {
    return (
      <svg role="img" aria-label={title} width={width} height={height}>
        <title>{title}</title>
        <rect
          x="0.5"
          y="0.5"
          width={width - 1}
          height={height - 1}
          rx="6"
          fill="none"
          stroke="var(--color-ink-700)"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const pad = 3;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const coords = points.map((point, index) => {
    const x = pad + (index * (width - pad * 2)) / (points.length - 1);
    const y = height - pad - ((point - min) / span) * (height - pad * 2);
    return { x, y };
  });
  const path = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");
  const last = coords[coords.length - 1];

  return (
    <svg role="img" aria-label={title} width={width} height={height} fill="none">
      <title>{title}</title>
      <path
        d={path}
        stroke={trendStroke[trend]}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r="2" fill={trendStroke[trend]} />
    </svg>
  );
}

export function TrendCell({
  points,
  trend,
  title,
}: {
  points: number[];
  trend: TrendDirection;
  title: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <Sparkline points={points} trend={trend} title={title} />
      <span className="text-eyebrow font-semibold uppercase tracking-[0.06em] whitespace-nowrap text-ink-500">
        {trendWord[trend]}
      </span>
    </span>
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
