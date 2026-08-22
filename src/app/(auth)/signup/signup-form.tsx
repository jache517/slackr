"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard, FormError, FormNotice } from "@/components/auth/auth-card";
import { PasswordField, TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui";
import {
  MIN_PASSWORD_LENGTH,
  authErrorMessage,
  isOffline,
} from "@/lib/auth/auth-messages";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmation?: string;
};

function validate(email: string, password: string, confirmation: string) {
  const errors: FieldErrors = {};

  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    errors.email = "Enter a complete email address.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  if (confirmation !== password) {
    errors.confirmation = "Both passwords must match.";
  }

  return errors;
}

/**
 * Account creation.
 *
 * Supabase can be configured either to hand back a session immediately or to
 * require the address be confirmed first, and the project's setting is not
 * knowable from here. Both endings are handled: a session means straight into
 * the app, no session means the account exists but is waiting on an email.
 */
export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingEmail, setAwaitingEmail] = useState(false);

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = email.trim();
    const errors = validate(trimmed, password, confirmation);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setBusy(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmed,
        password,
      });

      if (signUpError) {
        setError(authErrorMessage(signUpError, "sign-up"));
        setBusy(false);
        return;
      }

      // No session means the project requires the address to be confirmed
      // before the account can be used.
      if (!data.session) {
        setAwaitingEmail(true);
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

    router.push("/projects");
    router.refresh();
  }

  if (awaitingEmail) {
    return (
      <AuthCard
        title="Confirm your email"
        intro={`We sent a link to ${email.trim()}. Open it to finish setting up your account.`}
        footer={
          <Link href="/login" className="font-semibold text-indigo-600">
            Back to sign in
          </Link>
        }
      >
        <FormNotice>
          The link expires after a while. If it does, sign in and ask for
          another.
        </FormNotice>
      </AuthCard>
    );
  }

  const ready =
    email.trim().length > 0 &&
    password.length > 0 &&
    confirmation.length > 0;

  return (
    <AuthCard
      title="Create your account"
      intro="One account owns the projects you set up and the reports they produce."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={signUp} noValidate className="flex flex-col gap-6">
        {error ? <FormError id="signup-error">{error}</FormError> : null}

        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          error={fieldErrors.email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <PasswordField
          label="Password"
          name="password"
          required
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          value={password}
          error={fieldErrors.password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <PasswordField
          label="Confirm password"
          name="confirm-password"
          required
          autoComplete="new-password"
          value={confirmation}
          error={fieldErrors.confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />

        <Button
          type="submit"
          aria-busy={busy || undefined}
          disabledReason={ready ? undefined : "Fill in every field."}
        >
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
