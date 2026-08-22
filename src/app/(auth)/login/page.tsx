import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in - Slackr" };

export default function LoginPage() {
  // The form reads search params to show "account created" and "password
  // updated" notices, which opts it out of prerendering without a boundary.
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
