import { AppSidebar } from "@/components/app-sidebar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen bg-surface-page">
      <a
        href="#main"
        className="sr-only-focusable absolute top-4 left-4 z-50 rounded-control border border-ink-300 bg-surface-card font-semibold text-ink-900"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <main
        id="main"
        tabIndex={-1}
        className="flex min-w-0 flex-1 flex-col gap-6 p-8"
      >
        {children}
      </main>
    </div>
  );
}
