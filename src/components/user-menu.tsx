"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { SettingsIcon } from "@/components/icons";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { initialsOf } from "@/lib/data/types";

/**
 * The account menu at the foot of the sidebar.
 *
 * It shows the address actually signed in, never a name from sample data: a
 * sidebar that names the wrong person is worse than one that names nobody.
 * Escape and a click outside both close it and return focus to the trigger.
 */
export function UserMenu({ email }: { email: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    firstItemRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    function onPointerDown(event: PointerEvent) {
      if (wrapRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const label = email ?? "Signed in";

  async function signOut() {
    setSigningOut(true);
    await createBrowserSupabaseClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={wrapRef} className="relative border-t border-rule pt-3">
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-control border border-rule bg-surface-card py-1 shadow-[0_8px_24px_rgba(22,22,26,0.16)]"
        >
          <Link
            ref={firstItemRef}
            role="menuitem"
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex min-h-9 items-center gap-3 px-3 text-body font-medium text-ink-900 no-underline hover:bg-surface-page"
          >
            <SettingsIcon size={16} />
            Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={signOut}
            aria-busy={signingOut || undefined}
            className="flex min-h-9 w-full items-center gap-3 px-3 text-left text-body font-medium text-ink-900 hover:bg-surface-page"
          >
            <SignOutIcon />
            Sign out
          </button>
        </div>
      ) : null}

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 rounded-control p-3 text-left transition-colors duration-[120ms] hover:bg-surface-page"
      >
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tint-indigo text-eyebrow font-semibold uppercase tracking-[0.06em] text-indigo-600"
        >
          {initialsOf(label.replace(/[@.]/g, " "))}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-semibold text-ink-900">
            {label}
          </span>
          <span className="block text-body font-normal text-ink-500">
            Account
          </span>
        </span>
      </button>
    </div>
  );
}

function SignOutIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3M12 12.5 15.5 9 12 5.5M15.5 9H7" />
    </svg>
  );
}
