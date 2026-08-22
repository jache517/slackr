## Status (last updated: 2026-08-22)

Done: Closed the schema gaps blocking the interface, then made the specified
interaction set real. Twelve commits on `feat/frontend-shell`: three migrations,
the toast and dialog primitives, and every screen's interactions wired.

Current state: `npm run check` passes. All six routes return 200 and the
figures still reconcile (shares 35/30/28/7, `49 + 40 + 14 = 103`, medians
13/25/50). The schema now has `meetings` + `meeting_attendance`,
`github_activity.author_username`, and `projects` reduced to `title` +
`deadline`; all four migrations were applied against a real local Postgres.
Working interactions: the New Project form (live summary, validation, discard
dialog, undoable toast), the Members match flow and roster row edit, Export as
PDF via print, Ask for context, and the three disclosures. Every page still
reads fixtures.

Next action: swap `src/lib/data/queries.ts` from fixtures to Supabase reads.
The accessors are already async, so no caller changes. Start with
`listProjects` and `getProject`, using `src/lib/supabase/server.ts`. Note that
the seed data does not exist yet: write `supabase/seed.sql` first with the
COMP30022 project so the figures above stay reproducible.

Blocked on: nothing.

## Routes

| Route | Screen |
|---|---|
| `/projects` | Projects |
| `/projects/new` | New Project |
| `/projects/[projectId]` | Project Dashboard |
| `/projects/[projectId]/members` | Members |
| `/projects/[projectId]/report` | Contribution Report |
| `/projects/[projectId]/report/[memberSlug]` | Member Detail |

## Where things live

- `src/app/(app)/` - the six screens, under a shared sidebar layout
- `src/components/toast.tsx` - `ToastProvider` + `useToast()`, mounted in the layout
- `src/components/dialog.tsx` - native `<dialog>`, focus in and focus returned
- `src/components/ui.tsx` - button, card, badge, stat tile, sparkline, bar
- `src/lib/data/queries.ts` - the swap seam for Supabase
- `supabase/migrations/` - initial schema plus the four from this session
- `design/FINAL_DESIGN.md` - the merge spec the screens were built from

## Not done yet

- Supabase wiring: every page reads fixtures, and there is no seed file
- Auth: no sign-in, no route protection. Member-level RLS waits on this
- New Project step 2 (connect the tools) and the invite flow
- The match-failure state: unreachable until matches are persisted
- The not-connected source cascade ships unrendered by design
- `design/` is untracked, not yet committed
