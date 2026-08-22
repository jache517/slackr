type IconProps = {
  size?: number;
  className?: string;
};

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

export function ProjectsIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 5.5h12M3 9h12M3 12.5h8" />
      <circle cx="15" cy="12.5" r="1.6" />
    </svg>
  );
}

export function ReportsIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3.5 14.5V8M7.5 14.5V4.5M11.5 14.5v-4M15.5 14.5V6.5" />
    </svg>
  );
}

export function MembersIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="7" cy="6.5" r="2.6" />
      <path d="M2.5 15c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" />
      <path d="M12.2 4.5a2.4 2.4 0 0 1 0 4.4M13.4 11.4c1.4.5 2.3 1.8 2.3 3.6" />
    </svg>
  );
}

export function ConnectionsIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7.5 10.5 5.8 12.2a2.9 2.9 0 0 1-4.1-4.1l2.2-2.2a2.9 2.9 0 0 1 4.1 0" />
      <path d="M10.5 7.5l1.7-1.7a2.9 2.9 0 0 1 4.1 4.1l-2.2 2.2a2.9 2.9 0 0 1-4.1 0" />
    </svg>
  );
}

export function SettingsIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="9" r="2.4" />
      <path d="M9 1.8v2M9 14.2v2M16.2 9h-2M3.8 9h-2M14.1 3.9l-1.4 1.4M5.3 12.7l-1.4 1.4M14.1 14.1l-1.4-1.4M5.3 5.3 3.9 3.9" />
    </svg>
  );
}

export function PlusIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 4v10M4 9h10" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M7 4l5 5-5 5" />
    </svg>
  );
}

export function FolderIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M2.5 5.5a1.5 1.5 0 0 1 1.5-1.5h2.6l1.4 1.8H14a1.5 1.5 0 0 1 1.5 1.5v5.2a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-7Z" />
    </svg>
  );
}

export function SourcesIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <ellipse cx="9" cy="4.6" rx="5.6" ry="2.1" />
      <path d="M3.4 4.6v8.8c0 1.16 2.51 2.1 5.6 2.1s5.6-.94 5.6-2.1V4.6M3.4 9c0 1.16 2.51 2.1 5.6 2.1s5.6-.94 5.6-2.1" />
    </svg>
  );
}

/**
 * The four-pointed sparkle that marks a generated artefact. Its three stars
 * carry `sparkle-star`, which is what the hover and press animation in
 * `globals.css` reaches for.
 */
export function SparkleIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        className="sparkle-star"
        d="M8 2.2 9.1 5.6a2 2 0 0 0 1.3 1.3l3.4 1.1-3.4 1.1a2 2 0 0 0-1.3 1.3L8 13.8l-1.1-3.4a2 2 0 0 0-1.3-1.3L2.2 8l3.4-1.1a2 2 0 0 0 1.3-1.3L8 2.2Z"
      />
      <path
        className="sparkle-star sparkle-star-a"
        d="M14 1.5l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L12 3.5l1.5-.5.5-1.5Z"
      />
      <path
        className="sparkle-star sparkle-star-b"
        d="M13.8 11.6l.45 1.35 1.35.45-1.35.45-.45 1.35-.45-1.35-1.35-.45 1.35-.45.45-1.35Z"
      />
    </svg>
  );
}

export function SyncIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M15 9a6 6 0 0 1-10.2 4.3M3 9a6 6 0 0 1 10.2-4.3" />
      <path d="M13.4 1.8v3h-3M4.6 16.2v-3h3" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M11 4 6 9l5 5" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4.5 7 9 11.5 13.5 7" />
    </svg>
  );
}

export function CheckIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 9.4 7.2 12.6 14 5.6" />
    </svg>
  );
}

export function WarningIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 3.4 17 16.6H1z" />
      <path d="M9 8.2v3.4" />
      <path d="M9 14.2v.1" />
    </svg>
  );
}

export function ClockIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M9 5.4V9l2.4 1.6" />
    </svg>
  );
}

export function CloseIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" />
    </svg>
  );
}

export function QuoteIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M15.5 11.5a2.2 2.2 0 0 1-2.2 2.2H6.9L3.5 16V5.7a2.2 2.2 0 0 1 2.2-2.2h7.6a2.2 2.2 0 0 1 2.2 2.2z" />
    </svg>
  );
}

export function LogoMark({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" aria-hidden>
      <rect x="2" y="3" width="8" height="2.6" rx="1.3" fill="#ffffff" />
      <rect x="2" y="7.7" width="13" height="2.6" rx="1.3" fill="#ffffff" />
      <rect x="2" y="12.4" width="5" height="2.6" rx="1.3" fill="#ffffff" />
      <circle cx="16" cy="9" r="1.5" fill="#ffffff" />
    </svg>
  );
}

/* ---------- Calendar ---------- */

export function CalendarIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="2.5" y="3.5" width="13" height="12" rx="2" />
      <path d="M2.5 7.5h13M6 2v3M12 2v3" />
    </svg>
  );
}

/* ---------- Source marks ----------
 *
 * The providers' own marks, drawn so a row is recognisable at a glance. They
 * are used to name the service each row collects from and nothing else: no
 * endorsement is implied and none of them is ours.
 */

export function GithubMark({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function GoogleDocsMark({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M4 2.5A1.5 1.5 0 0 1 5.5 1H12l4 4v12.5A1.5 1.5 0 0 1 14.5 19h-9A1.5 1.5 0 0 1 4 17.5v-15Z"
        fill="#4285f4"
      />
      <path d="M12 1l4 4h-4V1Z" fill="#a1c2fa" />
      <path
        d="M7 8.5h6M7 11h6M7 13.5h4"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoogleMark({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M19.6 10.2c0-.7-.06-1.36-.18-2H10v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.74 3-4.3 3-7.3Z"
        fill="#4285f4"
      />
      <path
        d="M10 20c2.7 0 4.96-.9 6.6-2.42l-3.2-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.8-1.76-5.6-4.12H1.1v2.58A10 10 0 0 0 10 20Z"
        fill="#34a853"
      />
      <path
        d="M4.4 11.9a6 6 0 0 1 0-3.83V5.5H1.1a10 10 0 0 0 0 9l3.3-2.6Z"
        fill="#fbbc05"
      />
      <path
        d="M10 3.96c1.47 0 2.79.5 3.83 1.5l2.84-2.84C14.96.99 12.7 0 10 0A10 10 0 0 0 1.1 5.5l3.3 2.57C5.2 5.72 7.4 3.96 10 3.96Z"
        fill="#ea4335"
      />
    </svg>
  );
}

export function GoogleMeetMark({ size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      className={className}
    >
      <path d="M2 6.5A1.5 1.5 0 0 1 3.5 5H12v10H3.5A1.5 1.5 0 0 1 2 13.5v-7Z" fill="#00832d" />
      <path d="M12 5v10l3-2.5V7.5L12 5Z" fill="#ffba00" />
      <path d="M15 7.5 18 5v10l-3-2.5v-5Z" fill="#00ac47" />
      <path d="M2 6.5A1.5 1.5 0 0 1 3.5 5H7v3H2V6.5Z" fill="#0066da" />
      <path d="M2 12h5v3H3.5A1.5 1.5 0 0 1 2 13.5V12Z" fill="#e94235" />
    </svg>
  );
}
