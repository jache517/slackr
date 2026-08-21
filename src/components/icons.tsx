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
