"use client";

import { useState } from "react";
import Link from "next/link";

import { AuthCard, FormError, FormNotice } from "@/components/auth/auth-card";
import { TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui";
import { authErrorMessage, isOffline } from "@/lib/auth/auth-messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Requests a password reset link.
 *
 * The confirmation is the same whether or not the address has an account, for
 * the same reason the sign-in error is vague: this form should not be usable
 * to find out who has signed up.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function request(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

      // A rate limit is worth saying out loud; anything else would leak
      // whether the address is known.
      if (resetError && resetError.code === "over_email_send_rate_limit") {
        setError(authErrorMessage(resetError, "recover"));
        setBusy(false);
        return;
      }
    } catch (cause) {
      setError(
        isOffline(cause)
          ? "The request did not reach Slackr. Check your connection."
          : "Something went wrong. Try again.",
      );
      setBusy(false);
      return;
    }

    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        intro={`If ${email.trim()} has an account, a reset link is on its way.`}
        footer={
          <Link href="/login" className="font-semibold text-indigo-600">
            Back to sign in
          </Link>
        }
      >
        <FormNotice>
          The link works once and expires after an hour.
        </FormNotice>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      intro="We will email you a link to set a new one."
      footer={
        <Link href="/login" className="font-semibold text-indigo-600">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={request} noValidate className="flex flex-col gap-6">
        {error ? <FormError id="reset-error">{error}</FormError> : null}

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

        <Button
          type="submit"
          aria-busy={busy || undefined}
          disabledReason={
            email.trim().length > 0 ? undefined : "Enter your email address."
          }
        >
          {busy ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
