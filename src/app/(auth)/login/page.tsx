import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in - Slackr" };

/**
 * The notices are read here rather than in the form. Reading them client-side
 * would put the whole form behind a Suspense boundary, which ships the sign-in
 * screen as an empty card until JavaScript arrives.
 */
export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  return (
    <LoginForm
      registered={first(params.registered) === "1"}
      reset={first(params.reset) === "1"}
      linkProblem={first(params.error) ?? null}
    />
  );
}
