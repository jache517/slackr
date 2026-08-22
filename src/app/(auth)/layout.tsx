import type { ReactNode } from "react";

/**
 * The signed-out shell. Every auth screen is one centred card on the page
 * background, so the surrounding chrome lives here rather than in each page.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-surface-page p-6 sm:p-8"
    >
      <div className="w-full max-w-110">{children}</div>
    </main>
  );
}
