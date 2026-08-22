# Slackr: Group Contribution Report Generator

Automatically collects observable contribution evidence from the tools a student
team already uses (GitHub and Google Docs), then generates a
transparent Group Contribution Report at the end of the project.

This is not a free-rider detector and does not produce a contribution score.
It organises evidence for instructor review: **evidence, not verdict.**

## The problem

```
Students know contribution is unequal
        ↓
Someone has to actively report it
        ↓
Fear of conflict / damaged relationships
        ↓
The issue may never be raised
```

## The workflow

```
Create Project → Add Members → Map Identities → Connect Sources
        → Collect Activity Evidence → Review → Add Context
        → Generate Contribution Report → Instructor Review
```

## Features

- **Project setup**: title, deadline, members
- **Identity mapping**: link each member to their GitHub username and Google account
- **Source connections**: public GitHub repository and Google Doc
- **Activity evidence**: commits and observable Docs edits/comments/suggestions
- **Member role and context**: self-reported role, responsibilities, and space for work the system cannot observe
- **Team evidence alerts**: neutral, rule-based prompts visible only to the team
- **Contribution Report**: deterministic per-member evidence with source-separated charts and an explicit evidence-only disclaimer
- **Optional AI draft**: role-aware, evidence-referenced summary that never replaces instructor review

## Tech stack

| Layer          | Choice                                  |
|----------------|------------------------------------------|
| Frontend       | Next.js (App Router) + TypeScript        |
| UI             | Tailwind CSS, shadcn/ui                  |
| Backend        | Next.js API Routes / Server Actions      |
| Database       | Supabase (PostgreSQL)                    |
| Auth           | Supabase Auth                            |
| GitHub data    | GitHub REST API                          |
| Google data    | Google OAuth + Drive Activity API        |
| Meet data      | Google Calendar / Meet attendance         |
| Optional AI    | Provider/model pending privacy review    |
| Deployment     | Vercel                                   |

## Getting started

Requires Docker running, and the Node.js version in [`.nvmrc`](./.nvmrc)
(`24.15.0`).

```bash
npm ci
npx supabase start      # prints the keys for .env.local
npx supabase db reset   # applies migrations, then seeds three projects
npm run dev
```

Copy [`.env.example`](./.env.example) to `.env.local` and fill it with the URL
and keys `supabase start` printed.

Open [http://localhost:3000](http://localhost:3000) and sign in:

| Field    | Value               |
|----------|---------------------|
| Email    | `owner@slackr.test` |
| Password | `slackr-demo`       |

That account exists only in the local seed and owns the three sample projects.
Start with COMP30022: it is the one with an unmatched GitHub account, so it
exercises the states the screens were designed for.

Run `npm run check` (lint + build) before pushing.

## Where the work stands

Every screen reads live data from Supabase. Nothing writes to it yet.

**Done:** the schema and migrations, a seed reproducing the design figures,
magic-link-free email/password auth with route protection, the read layer in
`src/lib/data/queries.ts`, and all ten screens.

**Not done, in the order it probably matters:**

1. **Writes.** Matching an account, editing a roster row and creating a project
   all change the screen and then forget. Each needs a server action.
   `src/app/(app)/projects/[projectId]/members/members-screen.tsx` is the first
   one: it should set `github_activity.member_id` for every row carrying that
   `author_username`.
2. **Collectors.** No GitHub, Docs or Meet data is ever fetched; it all comes
   from `supabase/seed.sql`. The tables they must fill are `github_activity`,
   `docs_activity`, `meetings` and `meeting_attendance`.
3. **New Project step 2**, connecting the tools, and the invite flow.
4. **Member-level access.** Every RLS policy keys on `projects.created_by`, so
   only an owner can read a project. `members.auth_user_id` exists and is
   unused; opening reads to members needs its own policies and review.

`PROGRESS.md` carries the current state and `DECISIONS.md` the reasoning behind
anything that looks surprising.

## Project scope

See [`slackr-mvp.md`](./slackr-mvp.md) for the full product spec, database
schema, and development plan.

**Out of scope for this MVP:** PR/code-review metrics, PDF/CSV
export, Canvas integration, contribution scoring, ranking, automatic grading,
free-rider classification, and AI judgement. The optional AI feature produces
only an evidence-grounded draft; it does not score or decide contribution.
