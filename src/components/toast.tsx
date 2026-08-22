"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { CloseIcon } from "@/components/icons";

/**
 * Toasts sit bottom-left, announce through `role="status"` and dismiss
 * themselves. A toast that reports a reversible change carries `Undo` and
 * gets the longer timer; once it goes, the change is final.
 */

const PLAIN_MS = 6000;
const UNDO_MS = 10000;

export type ToastRequest = {
  message: string;
  /** Runs when the reader presses Undo. Its presence adds the button. */
  onUndo?: () => void;
};

type ToastState = ToastRequest & { id: number; duration: number };

const ToastContext = createContext<((toast: ToastRequest) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast must be used inside <ToastProvider>");
  return show;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const show = useCallback((request: ToastRequest) => {
    nextId.current += 1;
    setToast({
      ...request,
      id: nextId.current,
      duration: request.onUndo ? UNDO_MS : PLAIN_MS,
    });
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => setToast(null)}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(onClose, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, onClose]);

  return (
    <div
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className="fixed bottom-6 left-6 z-50 flex max-w-100 items-start gap-4 rounded-control bg-ink-900 px-4 py-3 text-body text-white shadow-[0_8px_24px_rgba(22,22,26,0.24)]"
    >
      <p className="min-w-0 flex-1">{toast.message}</p>

      {toast.onUndo ? (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.();
            onClose();
          }}
          className="shrink-0 font-semibold text-white underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
        >
          Undo
        </button>
      ) : null}

      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="flex size-6 shrink-0 items-center justify-center rounded-control text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        <CloseIcon size={14} />
      </button>
    </div>
  );
}
