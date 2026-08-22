## Status (last updated: 2026-08-22)

Done: The frontend is complete and running on live Supabase data. Ten screens,
email/password sign-in, route protection, and an account menu. All four
top-level nav routes that used to 404 are built.

Current state: `npm run check` passes. Signed in as `owner@slackr.test`
(password `slackr-demo`), every route renders from Postgres and the figures
reconcile: per-member 36/31/29/7 verified in psql, `49 + 40 + 14 = 103`,
shares 35/30/28/7, medians 13/25/50. Nothing writes to the database yet: every
interaction changes the screen and forgets on reload.

Next action: the first write. In
`src/app/(app)/projects/[projectId]/members/members-screen.tsx`, `match()` only
calls `setState`. Add a server action setting `github_activity.member_id` for
every row with that `author_username`, have `Undo` clear it, and
`revalidatePath` so the dashboard's check count and the report's shares follow.
Verify by matching, reloading, and confirming 103 becomes 109.

Blocked on: nothing.

## Running it locally

Docker must be running.

1. `npm ci`
2. `npx supabase start` - prints the keys for `.env.local` (see `.env.example`)
3. `npx supabase db reset` - applies migrations and seeds three projects
4. `npm run dev`, then sign in as `owner@slackr.test` / `slackr-demo`

## Routes

| Route | Screen |
|---|---|
| `/login` | Sign in |
| `/auth/callback` | Session exchange (unused by password sign-in) |
| `/projects` | Projects |
| `/projects/new` | New Project |
| `/projects/[projectId]` | Project Dashboard |
| `/projects/[projectId]/members` | Members |
| `/projects/[projectId]/report` | Contribution Report |
| `/projects/[projectId]/report/[memberSlug]` | Member Detail |
| `/reports` | All reports |
| `/members` | All members |
| `/connections` | Source connections |
| `/settings` | Account (reached from the sidebar account menu) |

## Where things live

- `src/app/(app)/` - every screen; the layout holds the session guard
- `src/lib/data/types.ts` - record shapes and every pure derivation
- `src/lib/data/queries.ts` - the Supabase reads and the assembly
- `src/lib/auth/require-session.ts` - cached per render, redirects to login
- `src/components/toast.tsx`, `dialog.tsx`, `user-menu.tsx` - interaction parts
- `supabase/seeds/02_demo_data.sql` - generated; timestamps relative to `now()`
- `design/FINAL_DESIGN.md` - the merge spec the six project screens follow

## Not done yet

- Nothing writes to the database; every interaction is local state
- No collectors: GitHub, Docs and Meet data all come from the seed
- New Project step 2 (connect the tools) and the invite flow
- Member-level RLS: policies are owner-only, `members.auth_user_id` unused
- The four top-level screens are not in `design/FINAL_DESIGN.md`, which specs
  six; nor is `/login`. They follow the same tokens but had no spec
- No browser has clicked any of this: verification was HTTP and psql only
