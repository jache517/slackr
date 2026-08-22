"use client";

import { useState } from "react";

import { Dialog } from "@/components/dialog";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui";

/**
 * Asking a member for context. The dialog states the outcome rather than
 * leaving the reader guessing what "Ask" does: the request goes out, the
 * reply window is named, and the button then says it has already been asked
 * so nobody sends the same request twice.
 *
 * The spec also put a confirmation line under the `<h1>`. The button's own
 * reason line says the same thing beside the control that caused it, so the
 * second copy is dropped rather than stated twice.
 */
export function AskForContext({ firstName }: { firstName: string }) {
  const showToast = useToast();
  const [open, setOpen] = useState(false);
  const [askedOn, setAskedOn] = useState<string | null>(null);
  const [note, setNote] = useState(
    `Hi ${firstName} - the report shows less recorded activity for you this month. Anything Slackr wouldn't have seen?`,
  );

  function send() {
    const today = new Date().toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
    setAskedOn(today);
    setOpen(false);
    showToast({
      message: `Asked ${today}. ${firstName} has 3 days to reply before the report is exported.`,
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={() => {
          // aria-disabled leaves the button focusable, so the guard is here.
          if (askedOn) return;
          setOpen(true);
        }}
        disabledReason={askedOn ? `Already asked on ${askedOn}.` : undefined}
        aria-describedby={askedOn ? "ask-reason" : undefined}
      >
        Ask {firstName} for context
      </Button>
      {askedOn ? (
        <p id="ask-reason" className="text-body text-ink-500">
          Already asked on {askedOn}.
        </p>
      ) : null}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Ask ${firstName} for context`}
        confirmLabel="Send request"
        cancelLabel="Cancel"
        onConfirm={send}
      >
        <div className="flex flex-col gap-2 text-left">
          <label
            htmlFor="ask-note"
            className="text-body font-semibold text-ink-900"
          >
            Your message
          </label>
          <textarea
            data-dialog-autofocus
            id="ask-note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded-control border border-ink-300 bg-surface-card p-3 text-body text-ink-900"
          />
        </div>
      </Dialog>
    </div>
  );
}
