"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SyncIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui";

/**
 * Collect again, now.
 *
 * The sync is idempotent, so the risk here is not a double press but a silent
 * one: the button reports what actually landed, including a sync that
 * completed and found nothing new.
 */
export function SyncButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const showToast = useToast();
  const [syncing, setSyncing] = useState(false);

  async function sync() {
    if (syncing) return;

    setSyncing(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/sync`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = (payload?.error as { message?: string })?.message;
        showToast({
          message: message ?? "The sources could not be synced.",
        });
        return;
      }

      const inserted = Number(payload?.data?.insertedCount ?? 0);
      const unmatched = Number(payload?.data?.unmatchedCount ?? 0);

      showToast({
        message:
          inserted === 0
            ? "Synced. Nothing new since the last collection."
            : `Synced. ${inserted} new ${inserted === 1 ? "commit" : "commits"} collected${
                unmatched > 0 ? `, ${unmatched} matched to nobody` : ""
              }.`,
      });

      router.refresh();
    } catch {
      showToast({ message: "The sync request did not reach Slackr." });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={sync}
      aria-busy={syncing || undefined}
      disabledReason={syncing ? "A sync is already running." : undefined}
    >
      <SyncIcon size={16} />
      {syncing ? "Syncing..." : "Sync"}
    </Button>
  );
}
