## Status (last updated: 2026-08-22)

Done: The app now runs on real data. Magic-link sign-in gates the six screens,
a seed reproduces the design figures from raw activity rows, and
`src/lib/data/queries.ts` reads Supabase instead of fixtures. Fixtures are
deleted.

Current state: `npm run check` passes. Signed in as `owner@slackr.test`, all
six routes render from Postgres and the figures still reconcile: per-member
36/31/29/7 verified in psql, `49 + 40 + 14 = 103`, shares 35/30/28/7, medians
13/25/50. Unauthenticated requests redirect to `/login`. Interactions are all
client-side still: matching an account, editing a roster row and creating a
project change the screen but write nothing back.

Next action: persist the match. `MembersScreen.match()` in
`src/app/(app)/projects/[projectId]/members/members-screen.tsx` currently only
sets state. Add a server action that sets `github_activity.member_id` for every
row with that `author_username`, and have `Undo` clear it again. That is the
first write in the app, so it also decides the shape of the rest.

Blocked on: nothing.

## Running it locally

1. `npx supabase start` - prints the keys for `.env.local` (see `.env.example`)
2. `npx supabase db reset` - applies migrations and seeds three projects
3. `npm run dev`, then sign in as `owner@slackr.test`
4. The sign-in link arrives in Mailpit at http://127.0.0.1:54324

## Routes

| Route | Screen |
|---|---|
| `/login` | Sign in |
| `/auth/callback` | Magic-link exchange |
| `/projects` | Projects |
| `/projects/new` | New Project |
| `/projects/[projectId]` | Project Dashboard |
| `/projects/[projectId]/members` | Members |
| `/projects/[projectId]/report` | Contribution Report |
| `/projects/[projectId]/report/[memberSlug]` | Member Detail |

## Where things live

- `src/app/(app)/` - the six screens; the layout holds the session guard
- `src/lib/data/types.ts` - record shapes and every pure derivation
- `src/lib/data/queries.ts` - the Supabase reads and the assembly
- `src/lib/auth/require-session.ts` - cached per render pass, redirects to login
- `src/components/toast.tsx`, `dialog.tsx` - the two interaction primitives
- `supabase/seed.sql` - generated; timestamps are relative to `now()`
- `design/FINAL_DESIGN.md` - the merge spec the screens were built from

## Not done yet

- Every interaction is local state: nothing writes to the database
- New Project step 2 (connect the tools) and the invite flow
- No real collectors: GitHub, Docs and Meet data all come from the seed
- Member-level RLS: policies are owner-only, `members.auth_user_id` unused
- The match-failure state: unreachable until matches are persisted
- `design/` is untracked, not yet committed
