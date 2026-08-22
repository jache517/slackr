"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui";

/**
 * Export is the browser's own print-to-PDF over the page's real markup, so
 * the exported file keeps the headings, table semantics and reading order the
 * screen has. There is no export service to call and no tagged-PDF pipeline to
 * build; a print stylesheet drops the chrome and leaves the report.
 *
 * No success toast fires: the print dialog does not tell the page whether the
 * reader saved the file or cancelled, and claiming a download that may not
 * exist is worse than saying nothing.
 */
export function ExportButton() {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const done = () => setBusy(false);
    window.addEventListener("afterprint", done);
    return () => window.removeEventListener("afterprint", done);
  }, []);

  return (
    <Button
      variant="secondary"
      aria-busy={busy || undefined}
      onClick={() => {
        setBusy(true);
        window.print();
      }}
    >
      Export as PDF
    </Button>
  );
}
