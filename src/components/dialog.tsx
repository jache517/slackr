"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui";

/**
 * A native `<dialog>` opened with `showModal()`, never a div overlay.
 *
 * Neither dialog in the product light-dismisses. `<dialog>` gives no backdrop
 * close route natively and none is added, so the only ways out are the two
 * action buttons and `Esc` - and `Esc` maps to the non-destructive choice.
 *
 * Focus moves into the dialog on open and returns to whatever opened it on
 * close, by every route. It lands on the element marked
 * `data-dialog-autofocus`, or on the cancel button when there is none. The
 * spec asked for the destructive button to take focus; it also asked that no
 * stray key be able to discard work. Those cannot both hold, so focus rests on
 * the safe control and the destructive one is reached deliberately.
 */
export function Dialog({
  open,
  onClose,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  children,
}: {
  open: boolean;
  /** The non-destructive close. `Esc` and the cancel button both land here. */
  onClose: () => void;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  /** Optional content between the body copy and the buttons. */
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      opener.current = document.activeElement as HTMLElement | null;
      dialog.showModal();

      const target = dialog.querySelector<HTMLElement>(
        "[data-dialog-autofocus]",
      );
      if (target) {
        target.focus();
        if (target instanceof HTMLTextAreaElement) {
          const end = target.value.length;
          target.setSelectionRange(end, end);
        }
      } else {
        cancelRef.current?.focus();
      }
    } else if (!open && dialog.open) {
      dialog.close();
      opener.current?.focus();
      opener.current = null;
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={body ? bodyId : undefined}
      onCancel={(event) => {
        // Esc: React owns the close so focus return runs exactly once.
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[min(480px,calc(100vw-3rem))] rounded-card border border-rule bg-surface-card p-6 text-ink-900 backdrop:bg-[rgba(22,22,26,0.45)]"
    >
      <div className="flex flex-col gap-4">
        <h2 id={titleId} className="text-subhead font-semibold text-ink-900">
          {title}
        </h2>
        {body ? (
          <p id={bodyId} className="text-body text-ink-500">
            {body}
          </p>
        ) : null}
        {children}
        <div className="flex justify-end gap-3">
          <Button ref={cancelRef} variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </dialog>
  );
}
