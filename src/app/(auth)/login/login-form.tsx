"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthCard, FormError, FormNotice } from "@/components/auth/auth-card";
import { PasswordField, TextField } from "@/components/auth/fields";
import { Button } from "@/components/ui";
import { authErrorMessage, isOffline } from "@/lib/auth/auth-messages";
import { usernameToEmail } from "@/lib/auth/username";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Username and password sign-in.
 *
 * The password never reaches this app's own storage: Supabase Auth holds the
 * hash and hands back a session.
 */
export function LoginForm({ registered = false }: { registered?: boolean }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
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

  const ready = username.trim().length > 0 && password.length > 0;

  return (
    <AuthCard
      title="Sign in to Slackr"
      intro="Use the username your group knows you by."
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
        {registered ? (
          <FormNotice>Account created. Sign in to get started.</FormNotice>
        ) : null}

        {error ? <FormError id="signin-error">{error}</FormError> : null}

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
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <PasswordField
          label="Password"
          name="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        <Button
          type="submit"
          aria-busy={busy || undefined}
          disabledReason={
            ready ? undefined : "Enter your username and password."
          }
        >
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthCard>
  );
}
