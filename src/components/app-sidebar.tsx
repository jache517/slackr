"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ConnectionsIcon,
  LogoMark,
  MembersIcon,
  ProjectsIcon,
  ReportsIcon,
} from "@/components/icons";
import { UserMenu } from "@/components/user-menu";

const NAV = [
  { key: "projects", label: "Projects", href: "/projects", Icon: ProjectsIcon },
  { key: "reports", label: "Reports", href: "/reports", Icon: ReportsIcon },
  { key: "members", label: "Members", href: "/members", Icon: MembersIcon },
  {
    key: "connections",
    label: "Connections",
    href: "/connections",
    Icon: ConnectionsIcon,
  },
];

/**
 * Which nav item owns the current URL. Report and member detail live under
 * a project route but belong to Reports in the information architecture.
 */
function currentKey(pathname: string) {
  if (pathname.includes("/report")) return "reports";
  if (pathname.includes("/members")) return "members";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/connections")) return "connections";
  // Settings has no nav item: it is reached from the account menu, so no
  // item should light up while it is open.
  if (pathname.startsWith("/settings")) return "none";
  return "projects";
}

export function AppSidebar({ email }: { email: string | null }) {
  const pathname = usePathname() ?? "/projects";
  const active = currentKey(pathname);

  return (
    <div
      data-print-hide
      className="flex w-65 shrink-0 flex-col gap-6 border-r border-rule bg-surface-card px-4 py-6"
    >
      <Link
        href="/projects"
        aria-label="Slackr home"
        className="flex items-center gap-3 px-3 no-underline"
      >
        <LogoMark className="shrink-0" />
        <span className="text-section font-semibold text-ink-900">Slackr</span>
      </Link>

      <nav aria-label="Main" className="flex-1">
        <ul className="flex list-none flex-col gap-1 p-0">
          {NAV.map(({ key, label, href, Icon }) => {
            const isCurrent = key === active;
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`relative flex min-h-9 items-center gap-3 rounded-control px-3 text-body no-underline transition-colors duration-[120ms] ease-out ${
                    isCurrent
                      ? "bg-tint-indigo font-semibold text-indigo-600"
                      : "font-medium text-ink-500 hover:bg-surface-track hover:text-ink-900"
                  }`}
                >
                  {isCurrent ? (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-indigo-600"
                    />
                  ) : null}
                  <Icon />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <UserMenu email={email} />
    </div>
  );
}
