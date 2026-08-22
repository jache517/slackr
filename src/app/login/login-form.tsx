"use client";

import { useState } from "react";

import { LogoMark } from "@/components/icons";
import { Button, Card } from "@/components/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Sign-in is a magic link. There is no password to store, reset or leak, and
 * the reader is already proving they hold the address the group will invite.
 * OAuth belongs beside this once the GitHub and Google credentials exist -
 * the product connects to both anyway - but it cannot be run locally yet.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (sendError) {
      setError("That link could not be sent. Check the address and try again.");
      setState("idle");
      return;
    }

    setState("sent");
  }

  return (
    <Card className="w-full max-w-110">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-tile bg-indigo-600">
            <LogoMark />
          </span>
          <span className="text-section font-semibold text-ink-900">Slackr</span>
        </div>

        {state === "sent" ? (
          <div className="flex flex-col gap-2" role="status">
            <h1 className="font-serif text-subhead text-ink-900">
              Check your email.
            </h1>
            <p className="text-body text-ink-500">
              A sign-in link is on its way to {email}. It works once and expires
              in an hour.
            </p>
          </div>
        ) : (
          <form onSubmit={send} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-subhead text-ink-900">
                Sign in to Slackr
              </h1>
              <p className="text-body text-ink-500">
                We&apos;ll email you a link. No password to remember.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-body font-semibold text-ink-900"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "email-error" : undefined}
                className="min-h-10 w-full rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-900 hover:border-ink-700"
              />
              {error ? (
                <p id="email-error" role="alert" className="text-body text-red-700">
                  {error}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              aria-busy={state === "sending" || undefined}
              disabledReason={email ? undefined : "Enter your email address."}
            >
              Email me a sign-in link
            </Button>
          </form>
        )}
      </div>
    </Card>
  );
}
