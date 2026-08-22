# Decisions

## 2026-08-22 - Merge the v1 layouts onto the v2 token system

Kept the v2 spec's tokens, semantics and accessibility, and took only the
layout and density from the earlier v1 design. Recorded per screen in
`design/FINAL_DESIGN.md`.
Why: v1 read better but was built on 22 blacklisted hexes, `<div>` nav items
and 10px type, none of which pass the contrast and semantics requirements.

## 2026-08-22 - Delete the deck paragraph from every screen header

Replaced the eyebrow line plus multi-sentence deck with a single meta line,
and a one-sentence qualifier only where the h1 needs one. Facts moved to the
element that owns them, so no number left the screen.
Why: the header block read as a wall of text before the reader reached
anything actionable. This overrides the spec's verbatim-copy rule.

## 2026-08-22 - Build pages against a fixture layer, not Supabase

`src/lib/data/queries.ts` exposes async accessors over fixture arrays.
Why: lets the six screens be built and reviewed before the schema gap is
resolved. The functions are already async, so swapping in real queries
changes no caller.

## 2026-08-22 - Derive shares and medians rather than hardcode them

Shares are computed from event counts and the group median excludes the
subject member.
Why: the spec's figures only reconcile if they come from one source. Deriving
them makes drift between screens structurally impossible.

## 2026-08-22 - Skip typedRoutes for now

`next.config.ts` leaves `typedRoutes` off and hrefs are plain strings.
Why: dynamic hrefs built from template strings need casting under typed
routes, which is friction with no payoff during a breadth pass.

## 2026-08-22 - Projects are a title and a deadline, not coursework

Dropped `course` and `group_name`, renamed `name` to `title`, and deleted the
hardcoded course dropdown from New Project.
Why: the schema modelled a university assignment. Nothing about the product
needs that, and the fixed course list made it unusable for any other group.

## 2026-08-22 - Store the GitHub login on commit activity

Added `github_activity.author_username`.
Why: the Members screen names unmatched accounts by handle and matches them
against `members.github_username`. A commit carries only a name and an email,
so neither was possible without it.

## 2026-08-22 - Doc comments and suggestions count as contribution

All three `docs_activity` types count toward a member's total, and the label
reads `Doc activity` rather than `Doc edits`.
Why: counting only edits understates anyone who reviews rather than writes,
which is the exact failure this report exists to prevent. The label changed
with the number so it is not claiming to be edits alone.

## 2026-08-22 - Export as PDF prints the page instead of calling a service

`Export as PDF` runs `window.print()` over the real markup, with a print
stylesheet dropping the chrome. No success toast fires.
Why: the browser's own export keeps the headings, table semantics and reading
order the screen already has, needs no backend, and works today. The print
dialog never tells the page whether the reader saved or cancelled, so claiming
a download would be a guess.

## 2026-08-22 - Dialog focus rests on the safe control

The discard dialog opens with focus on `Keep editing`, not on `Discard`.
Why: the spec asked for both the destructive button to take focus and for no
stray key to be able to discard work. Those cannot both hold. Focus went to
the safe choice and the destructive one is reached deliberately.

## 2026-08-22 - The match-failure state is not built

The Members screen has no "already linked to someone else" error path.
Why: an unmatched account is by definition one nobody has claimed, so the
conflict cannot arise against this data. It can only appear as a rejected
write, so it belongs with the change that persists matches rather than as
unreachable code ahead of it.

## 2026-08-22 - Member-level RLS waits for auth

Every policy still reads `projects.created_by = auth.uid()`, so only owners
can read a project. `members.auth_user_id` is unused.
Why: there is no sign-in flow, so no member can be authenticated yet. Opening
reads to a class of users that cannot exist would be an unreviewable security
change with no way to test it.
