import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in - Slackr" };

export default function LoginPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-surface-page p-8"
    >
      <LoginForm />
    </main>
  );
}
