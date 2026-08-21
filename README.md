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

- **Project setup**: name, course, deadline, group, members
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
| Optional AI    | Provider/model pending privacy review    |
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

**Out of scope for this MVP:** Google Meet, PR/code-review metrics, PDF/CSV
export, Canvas integration, contribution scoring, ranking, automatic grading,
free-rider classification, and AI judgement. The optional AI feature produces
only an evidence-grounded draft; it does not score or decide contribution.

See [`docs/decisions/report-presentation-and-ai.md`](./docs/decisions/report-presentation-and-ai.md)
for the separation between team-only alerts and the instructor-facing report.
