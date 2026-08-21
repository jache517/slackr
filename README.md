# Slackr: Group Contribution Report Generator

Automatically collects observable contribution evidence from the tools a student
team already uses (GitHub, Google Docs, Google Meet), then generates a
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

- **Project setup**: name, course, deadline, group, members
- **Identity mapping**: link each member to their GitHub username and Google account
- **Source connections**: GitHub repo, Google Doc, Google Meet
- **Activity evidence**: commits, PRs, doc edits/comments, meeting attendance
- **Member context**: space for contribution the system can't observe (interviews, design, offline work)
- **Contribution Report**: per-member evidence summary, exportable, with an explicit "review suggested, not decided" note

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
| Deployment     | Vercel                                   |

## Getting started

Use the Node.js version recorded in [`.nvmrc`](./.nvmrc) (`24.15.0`), then run:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project scope

See [`slackr-mvp.md`](./slackr-mvp.md) for the full product spec, database
schema, and development plan.

**Out of scope for this MVP:** Canvas integration, contribution scoring,
automatic grading, free-rider classification, ML-based judgement.
