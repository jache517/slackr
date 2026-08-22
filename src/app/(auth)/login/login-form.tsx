"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { AuthCard, FormError, FormNotice } from "@/components/auth/auth-card";
import { PasswordField, TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui";
import { authErrorMessage, isOffline } from "@/lib/auth/auth-messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Email and password sign-in.
 *
 * The password never reaches this app's own storage: Supabase Auth holds the
 * hash and hands back a session.
 */
export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const justRegistered = params.get("registered") === "1";
  const justReset = params.get("reset") === "1";
  const linkProblem = params.get("error");

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(authErrorMessage(signInError, "sign-in"));
        setBusy(false);
        return;
      }
    } catch (cause) {
      setError(
        isOffline(cause)
          ? "The sign-in request did not reach Slackr. Check your connection."
          : "Something went wrong. Try again.",
      );
      setBusy(false);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  const ready = email.trim().length > 0 && password.length > 0;

  return (
    <AuthCard
      title="Sign in to Slackr"
      intro="Use the email address your group knows you by."
      footer={
        <>
          New to Slackr?{" "}
          <Link href="/signup" className="font-semibold text-indigo-600">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={signIn} noValidate className="flex flex-col gap-6">
        {justRegistered ? (
          <FormNotice>Account created. Sign in to get started.</FormNotice>
        ) : null}

        {justReset ? (
          <FormNotice>Password updated. Sign in with it now.</FormNotice>
        ) : null}

        {linkProblem === "expired" ? (
          <FormError id="link-error">
            That link has expired. Request a new one.
          </FormError>
        ) : null}

        {error ? <FormError id="signin-error">{error}</FormError> : null}

        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordField
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          action={
            <Link
              href="/forgot-password"
              className="text-body font-medium text-indigo-600"
            >
              Forgot password?
            </Link>
          }
        />

        <Button
          type="submit"
          aria-busy={busy || undefined}
          disabledReason={ready ? undefined : "Enter your email and password."}
        >
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
