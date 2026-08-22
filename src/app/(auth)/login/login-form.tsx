"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { LogoMark } from "@/components/icons";
import { Button, Card } from "@/components/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Email and password sign-in.
 *
 * The password never reaches this app's own storage: Supabase Auth holds the
 * hash and hands back a session. The failure message is deliberately the same
 * whether the address is unknown or the password is wrong, so the form cannot
 * be used to find out which addresses have accounts.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createBrowserSupabaseClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("That email and password do not match an account.");
      setBusy(false);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  const ready = email.length > 0 && password.length > 0;

  return (
    <Card className="w-full max-w-110">
      <form onSubmit={signIn} className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <LogoMark className="shrink-0" />
          <span className="text-section font-semibold text-ink-900">Slackr</span>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-subhead text-ink-900">
            Sign in to Slackr
          </h1>
          <p className="text-body text-ink-500">
            Use the email address your group knows you by.
          </p>
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-control bg-tint-red px-3 py-2 text-body text-red-700"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-body font-semibold text-ink-900">
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
            className={control}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-body font-semibold text-ink-900"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={error ? true : undefined}
            className={control}
          />
        </div>

        <Button
          type="submit"
          aria-busy={busy || undefined}
          disabledReason={ready ? undefined : "Enter your email and password."}
        >
          Sign in
        </Button>
      </form>
    </Card>
  );
}

const control =
  "min-h-10 w-full rounded-control border border-ink-300 bg-surface-card px-3 text-body text-ink-900 transition-colors duration-[120ms] hover:border-ink-700 aria-invalid:border-red-700";
