"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard, FormError } from "@/components/auth/auth-card";
import { PasswordField, TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui";
import {
  MIN_PASSWORD_LENGTH,
  authErrorMessage,
  isOffline,
} from "@/lib/auth/auth-messages";
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  usernameProblem,
  usernameToEmail,
} from "@/lib/auth/username";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type FieldErrors = {
  username?: string;
  password?: string;
  confirmation?: string;
};

function validate(username: string, password: string, confirmation: string) {
  const errors: FieldErrors = {};

  const nameProblem = usernameProblem(username);
  if (nameProblem) errors.username = nameProblem;

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
 * There is no email address and so nothing to confirm: the account is usable
 * the moment it exists. A project still configured to require confirmation
 * hands back no session, which cannot be resolved from here, so that case is
 * reported as the misconfiguration it is rather than as a wait.
 */
export function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const errors = validate(username, password, confirmation);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setBusy(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: usernameToEmail(username),
        password,
      });

      if (signUpError) {
        setError(authErrorMessage(signUpError, "sign-up"));
        setBusy(false);
        return;
      }

      if (!data.session) {
        setError(
          "This site is not set up for username accounts yet. Ask an admin to turn off email confirmation.",
        );
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

  const ready =
    username.trim().length > 0 &&
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
          label="Username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          hint={`${MIN_USERNAME_LENGTH} to ${MAX_USERNAME_LENGTH} characters. Letters and numbers, with hyphens or underscores inside.`}
          value={username}
          error={fieldErrors.username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <PasswordField
          label="Password"
          name="password"
          required
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. There is no way to reset it, so keep it somewhere safe.`}
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
