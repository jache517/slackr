"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard, FormError } from "@/components/auth/auth-card";
import { PasswordField } from "@/components/auth/fields";
import { Button } from "@/components/ui";
import {
  MIN_PASSWORD_LENGTH,
  authErrorMessage,
  isOffline,
} from "@/lib/auth/auth-messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Sets a new password.
 *
 * Reached from the emailed link, which /auth/callback has already exchanged
 * for a session. Without that session there is nothing to update, so the form
 * says so rather than failing on submit.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [mismatch, setMismatch] = useState<string | undefined>();
  const [tooShort, setTooShort] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorised, setAuthorised] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    createBrowserSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        if (active) setAuthorised(Boolean(data.session));
      })
      .catch(() => {
        if (active) setAuthorised(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function update(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const short =
      password.length < MIN_PASSWORD_LENGTH
        ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
        : undefined;
    const unmatched =
      confirmation === password ? undefined : "Both passwords must match.";

    setTooShort(short);
    setMismatch(unmatched);

    if (short || unmatched) return;

    setBusy(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(authErrorMessage(updateError, "update"));
        setBusy(false);
        return;
      }

      await supabase.auth.signOut();
    } catch (cause) {
      setError(
        isOffline(cause)
          ? "The request did not reach Slackr. Check your connection."
          : "Something went wrong. Try again.",
      );
      setBusy(false);
      return;
    }

    router.push("/login?reset=1");
    router.refresh();
  }

  if (authorised === false) {
    return (
      <AuthCard
        title="That link is no longer valid"
        intro="Reset links work once and expire after an hour."
        footer={
          <Link href="/login" className="font-semibold text-indigo-600">
            Back to sign in
          </Link>
        }
      >
        <Link
          href="/forgot-password"
          className="text-body font-semibold text-indigo-600"
        >
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Set a new password"
      intro="You will be signed out everywhere else once this is saved."
      footer={
        <Link href="/login" className="font-semibold text-indigo-600">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={update} noValidate className="flex flex-col gap-6">
        {error ? <FormError id="update-error">{error}</FormError> : null}

        <PasswordField
          label="New password"
          name="password"
          required
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={password}
          error={tooShort}
          onChange={(event) => setPassword(event.target.value)}
        />

        <PasswordField
          label="Confirm new password"
          name="confirm-password"
          required
          autoComplete="new-password"
          value={confirmation}
          error={mismatch}
          onChange={(event) => setConfirmation(event.target.value)}
        />

        <Button
          type="submit"
          aria-busy={busy || undefined}
          disabledReason={
            password.length > 0 && confirmation.length > 0
              ? undefined
              : "Enter the new password twice."
          }
        >
          {busy ? "Saving…" : "Save password"}
        </Button>
      </form>
    </AuthCard>
  );
}
