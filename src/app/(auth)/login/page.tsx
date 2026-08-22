import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in - Slackr" };

/**
 * The notice is read here rather than in the form. Reading it client-side
 * would put the whole form behind a Suspense boundary, which ships the sign-in
 * screen as an empty card until JavaScript arrives.
 */
export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const registered = Array.isArray(params.registered)
    ? params.registered[0]
    : params.registered;

  return <LoginForm registered={registered === "1"} />;
}
