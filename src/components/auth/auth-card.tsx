import type { ReactNode } from "react";

import { LogoMark } from "@/components/icons";
import { Card } from "@/components/ui";

/**
 * The frame shared by every auth screen: brand, heading, and a footer line
 * pointing at whichever screen the reader probably wanted instead.
 */
export function AuthCard({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <LogoMark className="shrink-0" />
            <span className="text-section font-semibold text-ink-900">
              Slackr
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-subhead font-semibold text-ink-900">{title}</h1>
            <p className="text-body text-ink-500">{intro}</p>
          </div>

          {children}
        </div>
      </Card>

      {footer ? (
        <p className="text-center text-body text-ink-500">{footer}</p>
      ) : null}
    </div>
  );
}

/**
 * A form-level failure. Announced immediately: the reader has usually just
 * pressed a button and is waiting to hear what happened.
 */
export function FormError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="rounded-control bg-tint-red px-3 py-2 text-body text-red-700"
    >
      {children}
    </p>
  );
}

/** A form-level success, for the screens that end in "go read your email". */
export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-control bg-tint-green px-3 py-2 text-body text-green-800"
    >
      {children}
    </p>
  );
}
