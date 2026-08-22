import { Card, PageHeader } from "@/components/ui";
import { requireSession } from "@/lib/auth/require-session";
import { listProjects } from "@/lib/data/queries";
import { SignOutButton } from "./sign-out-button";

export const metadata = { title: "Settings - Slackr" };

/**
 * Account settings. Only what is real is shown: the address you signed in
 * with, what it owns, and the way out. Preferences nobody has built would be
 * controls that quietly do nothing.
 */
export default async function SettingsPage() {
  const { supabase } = await requireSession();
  const { data } = await supabase.auth.getUser();
  const projects = await listProjects();

  const email = data.user?.email ?? "Unknown";
  const members = projects.reduce(
    (count, project) => count + project.memberCount,
    0,
  );

  return (
    <>
      <PageHeader
        title="Your account"
        actions={<SignOutButton />}
      />

      <Card>
        <div className="flex flex-col gap-4">
          <h2 className="text-subhead font-semibold text-ink-900">Account</h2>
          <dl className="flex flex-col gap-0">
            <Row label="Email address" value={email} />
            <Row
              label="Projects you own"
              value={`${projects.length} project${projects.length === 1 ? "" : "s"}`}
            />
            <Row
              label="Members across them"
              value={`${members} member${members === 1 ? "" : "s"}`}
            />
            <Row label="Sign-in method" value="Email and password" last />
          </dl>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-2">
          <h2 className="text-subhead font-semibold text-ink-900">
            What Slackr collects
          </h2>
          <p className="max-w-220 text-body text-ink-500">
            Slackr records commits, document activity and meeting attendance for
            the sources each project connects. It records what was done and
            when, never the contents of a document or a call.
          </p>
        </div>
      </Card>
    </>
  );
}

function Row({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[220px_1fr] items-baseline gap-4 py-3.5 ${
        last ? "" : "border-b border-rule"
      }`}
    >
      <dt className="text-body text-ink-500">{label}</dt>
      <dd className="m-0 text-body text-ink-900">{value}</dd>
    </div>
  );
}
