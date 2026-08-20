# Catalyst 2026 — Group Contribution Report Generator MVP

## 1. Product Positioning

We are not building a system that detects “free riders,” and we are not building an automatic contribution scoring system.

The core product is:

> **Automatically collect observable contribution evidence from the collaboration tools a student team already uses, then generate a transparent Group Contribution Report at the end of the project.**

The goal is to reduce the social cost of traditional peer reporting.

The current problem often looks like:

```text
Students know that contribution is unequal
        ↓
Someone has to actively report it
        ↓
Fear of conflict / damaged relationships
        ↓
Uncertainty about whether there is enough evidence
        ↓
The issue may never be raised
```

Our proposed workflow is:

```text
Create Project
      ↓
Connect GitHub / Google Docs / Meetings
      ↓
System collects observable activity evidence
      ↓
Project ends
      ↓
Generate Contribution Report
      ↓
Report accompanies the assignment submission
      ↓
Tutor reviews evidence + student context
```

Core principle:

> **Evidence, not verdict.**

The system organises evidence. It does not decide who is a free rider.

---

# 2. Core MVP Flow

```text
Create Project
      ↓
Add Members
      ↓
Map Member Identities
      ↓
Connect Contribution Sources
      ↓
Collect Activity Evidence
      ↓
Review Member Contribution
      ↓
Add Missing Context
      ↓
Generate Contribution Report
      ↓
Instructor / Tutor Review
```

---

# 3. Page 1 — Projects

The homepage shows projects the user has created or joined.

Example:

```text
Your Projects

COMP30022 Final Project
4 members
2 sources connected
Deadline: 30 Aug

SWEN30006 Project
3 members
1 source connected

[ + New Project ]
```

Each project opens into the Project Dashboard.

---

# 4. Page 2 — New Project / Project Setup

When creating a project:

```text
Project Name
COMP30022 Final Project

Course
COMP30022

Deadline
30 Aug

Group Name
Group 7
```

Then add members:

```text
Members

Alice Zhang
Bob Chen
Kevin Liu
Sheldon Liu

[ + Add Member ]
```

---

# 5. Member Identity Mapping

This is a key product feature.

A member such as:

```text
Alice Zhang
```

may appear on different platforms as:

```text
GitHub:
alice-dev

Google:
alice@student.unimelb.edu.au
```

Each member therefore needs one unified identity profile.

Example:

```text
Alice Zhang
────────────────────────

University Email
alice@student.unimelb.edu.au

GitHub
✓ alice-dev

Google
✓ alice@student.unimelb.edu.au
```

Kevin:

```text
Kevin Liu
────────────────────────

University Email
kevin@student.unimelb.edu.au

GitHub
✓ kevinpush

Google
✓ kevin@student.unimelb.edu.au
```

---

# 6. Identity Mapping for the 3-Day MVP

A production system could use:

```text
Invite Member
      ↓
Member signs in
      ↓
Connect GitHub
      ↓
Connect Google
      ↓
Identity verified
```

For a 3-day MVP, do not build the complete invitation and verification flow.

The Project Owner can manually map identities:

```text
Member Name:
Kevin Liu

GitHub Username:
kevinpush

Google Account:
kevin@student.unimelb.edu.au
```

This keeps implementation manageable.

---

# 7. Page 3 — Connected Sources

Each project can connect contribution sources.

```text
Contribution Sources

GitHub
[ Connect Repository ]

Google Docs
[ Connect Document ]

Google Meet
[ Connect Meeting ]
```

After connection:

```text
GitHub Repository
✓ group7/final-project

Google Docs
✓ Final Project Report

Google Meet
△ Not Connected
```

---

# 8. GitHub Integration

GitHub is the most suitable real API integration for the MVP.

Recommended data:

```text
Commit author
Commit timestamp
Commit message
Commit count
Last active time
```

If time remains:

```text
Pull Requests
Code Reviews
```

Example:

```text
Alice

GitHub
────────────────
18 commits
3 pull requests
2 reviews
Last active: Today
```

Kevin:

```text
Kevin

GitHub
────────────────
2 commits
0 pull requests
0 reviews
Last active: 9 days ago
```

Do not convert activity directly into a score such as:

```text
18 commits = 90 contribution points
```

Commit count is evidence, not a measure of contribution quality.

---

# 9. Google Docs Integration

Google Docs should not be used to claim:

```text
Alice wrote 3,842 words
Bob wrote 2,194 words
```

The official APIs do not provide a reliable per-author text contribution count.

Google Docs should instead be treated as:

> **Document Activity Evidence**

Useful signals include:

```text
Edit activities
Comments
Suggestions
Last activity time
```

Example:

```text
Alice

Google Docs
────────────────
14 edit activities
4 comments
2 suggestions
Last active: 3 hours ago
```

Kevin:

```text
Kevin

Google Docs
────────────────
3 edit activities
0 comments
0 suggestions
Last active: 8 days ago
```

These metrics represent observable account activity in the document.

They do not represent an exact percentage of real contribution.

---

# 10. Google Meet Integration

Google Meet can be a Stretch Goal.

A production version could track:

```text
Meetings attended
Total attendance time
Join time
Leave time
```

Example:

```text
Alice
4 / 4 meetings
213 minutes

Kevin
2 / 4 meetings
71 minutes
```

For two developers over three days:

```text
GitHub       Real API
Google Docs  Real API
Google Meet  Manual Input / Stretch Goal
```

If the Meet API is not implemented, meeting attendance can be entered manually:

```text
Meeting #4

Alice     ✓
Bob       ✓
Kevin     ✗
Sheldon   ✓
```

---

# 11. Page 4 — Project Dashboard

The Project Dashboard shows the current state of the project.

Example:

```text
COMP30022 Final Project

Members
4

Sources Connected
2

Deadline
30 Aug

Contribution Sources

✓ GitHub
✓ Google Docs
△ Google Meet

[ Manage Members ]
[ Manage Sources ]
[ Generate Report ]
```

A simple Member Overview can appear below:

| Member | GitHub | Docs | Meetings |
|---|---:|---:|---:|
| Alice | 18 commits | 14 activities | 4/4 |
| Bob | 13 commits | 19 activities | 4/4 |
| Kevin | 2 commits | 3 activities | 2/4 |
| Sheldon | 16 commits | 11 activities | 4/4 |

No complex analytics dashboard is required.

---

# 12. Page 5 — Member Detail / Identity Mapping

Clicking a member opens:

```text
Kevin Liu

Connected Identities
────────────────
GitHub
✓ kevinpush

Google
✓ kevin@student.unimelb.edu.au

Contribution Evidence
────────────────

GitHub
2 commits
Last active: 9 days ago

Google Docs
3 edit activities
0 comments
Last active: 8 days ago

Meetings
2 / 4 attended
```

Include:

```text
[ Edit Identity Mapping ]
```

---

# 13. Member Context

This feature handles contribution the system cannot observe.

For example, Kevin may show:

```text
GitHub
2 commits

Google Docs
3 activities

Meetings
2 / 4
```

but may have been responsible for:

```text
User Interviews
Figma Design
Presentation
Offline Research
```

Before the report is finalised, each member can review:

```text
Review Your Contribution

Recorded Evidence

GitHub
2 commits

Google Docs
3 activities

Meetings
2 / 4

Does this miss any significant contribution?

[ Add Context ]
```

Kevin can add:

```text
I conducted five user interviews and created
the final presentation in Figma.
```

The final report includes both:

```text
Recorded Evidence
+
Member Context
```

This reduces the risk of misleading conclusions.

---

# 14. Page 6 — Contribution Report

This is the core final-demo screen.

Header:

```text
Group Contribution Report

COMP30022 Final Project
Group 7

Monitoring Period
1 Aug → 28 Aug

Connected Sources
✓ GitHub
✓ Google Docs
✓ Meetings
```

Member overview:

| Member | GitHub | Docs | Meetings | Context |
|---|---:|---:|---:|---|
| Alice | 18 commits | 14 activities | 4/4 | — |
| Bob | 13 commits | 19 activities | 4/4 | — |
| Kevin | 2 commits | 3 activities | 2/4 | View |
| Sheldon | 16 commits | 11 activities | 4/4 | — |

The system may surface:

```text
Review Suggested

Kevin has fewer recorded activities
across multiple connected sources.

This is an evidence signal only.
It does not determine individual contribution.
Instructor review is required.
```

---

# 15. Member Report Detail

When the tutor opens Kevin:

```text
Kevin Liu

Recorded Evidence
────────────────────────

GitHub
2 commits
Last active: 9 days ago

Google Docs
3 edit activities
0 comments
Last active: 8 days ago

Meetings
2 / 4 attended

Activity Timeline
────────────────────────

Aug 5
Task activity recorded

Aug 10
Meeting absent

Aug 12
GitHub commit

Aug 18
Meeting absent

Member Context
────────────────────────

“I was responsible for conducting five
user interviews and creating the final
presentation in Figma.”
```

The final judgement remains with the instructor.

---

# 16. Canvas Integration — Future Product

A future version could support:

```text
Student submits assignment in Canvas
        ↓
Contribution system generates report
        ↓
Report is automatically attached
        ↓
Tutor sees:
Assignment
+
Contribution Report
```

The 3-day MVP should not integrate with UniMelb Canvas.

Reasons include:

```text
LTI registration
Canvas permissions
Institution approval
Security / privacy review
```

Instead, the MVP ends with:

```text
[ Generate Contribution Report ]
```

The pitch can explain:

> Future integration would attach this report to the Canvas group submission workflow.

---

# 17. Recommended Tech Stack

For two developers over three days:

```text
Frontend
Next.js + TypeScript

UI
Tailwind CSS
shadcn/ui

Backend
Next.js API Routes / Server Actions

Database
Supabase PostgreSQL

Authentication
Supabase Auth

GitHub Integration
GitHub REST API / OAuth

Google Integration
Google OAuth
Google Drive Activity API

Deployment
Vercel
```

Do not add:

```text
NestJS
Redis
Microservices
Queues
Kubernetes
```

---

# 18. Simplified Database Structure

## projects

```text
id
name
course
group_name
deadline
created_by
created_at
```

## members

```text
id
project_id
name
email
github_username
google_email
google_person_id
```

## source_connections

```text
id
project_id
source_type
external_id
display_name
connected_at
```

source_type:

```text
github
google_docs
google_meet
```

## github_activity

```text
id
project_id
member_id
commit_sha
commit_message
timestamp
```

## docs_activity

```text
id
project_id
member_id
activity_type
timestamp
```

activity_type:

```text
edit
comment
suggestion
```

## meetings

```text
id
project_id
meeting_date
duration
```

## meeting_attendance

```text
meeting_id
member_id
minutes_attended
```

## member_context

```text
id
project_id
member_id
context_text
created_at
```

---

# 19. 3-Day Development Scope

## Must Have

```text
✓ New Project
✓ Add Members
✓ Member Identity Mapping
✓ Connect GitHub Repo
✓ Connect Google Doc
✓ GitHub activity retrieval
✓ Google Docs activity retrieval
✓ Project Dashboard
✓ Member Detail
✓ Generate Contribution Report
```

## Strongly Recommended

```text
✓ Member Context
```

This directly addresses fairness and missing-evidence risks.

## Stretch Goals

```text
△ Google Meet API
△ Pull Request data
△ Code Review data
△ PDF Export
△ Real member invitation flow
```

## Do Not Build

```text
✗ Canvas integration
✗ Contribution score
✗ Automatic grading
✗ Free-rider classification
✗ AI judgement
✗ Machine learning
✗ Complex analytics
✗ Real-time monitoring
✗ Mobile app
```

---

# 20. Two-Person Development Split

## Developer A — Frontend

### Day 1

```text
Projects
New Project
Add Members
Identity Mapping UI
Connected Sources UI
```

### Day 2

```text
Project Dashboard
Member Detail
Contribution Report UI
Member Context
```

### Day 3

```text
Backend integration
Loading states
Error states
Demo polish
Responsive fixes
```

---

## Developer B — Backend / Integrations

### Day 1

```text
Supabase schema
Project CRUD
Member CRUD
Source Connections
```

### Day 2

```text
GitHub API
Google OAuth
Google Drive Activity API
Member identity mapping
Normalised activity data
```

### Day 3

```text
Generate report endpoint
Integration bugs
Demo data
Deployment
Optional Meet integration
```

---

# 21. Three-Day Development Plan

## Day 1

Goal:

```text
Create Project
↓
Add Members
↓
Save Identity Mapping
↓
Show Project Dashboard
```

A working vertical slice should exist by the end of Day 1.

## Day 2

Goal:

```text
Connect GitHub
↓
Connect Google Docs
↓
Fetch Activity
↓
Map Activity to Members
↓
Show Member Evidence
```

Core integrations should be working by the end of Day 2.

## Day 3

Goal:

```text
Review Contribution
↓
Add Member Context
↓
Generate Contribution Report
```

Day 3 should focus on:

```text
Bug fixing
Demo data
UI polish
Pitch
```

Do not add major new features on Day 3.

---

# 22. Demo Scenario

Project:

```text
COMP30022 Final Project
Group 7
```

Members:

```text
Alice
Bob
Kevin
Sheldon
```

Connected sources:

```text
GitHub
group7/final-project

Google Docs
Final Project Report
```

Generated evidence:

```text
Alice
18 commits
14 Docs activities
4/4 meetings

Bob
13 commits
19 Docs activities
4/4 meetings

Kevin
2 commits
3 Docs activities
2/4 meetings

Sheldon
16 commits
11 Docs activities
4/4 meetings
```

Kevin adds:

```text
Member Context

I conducted five user interviews and
created the final Figma presentation.
```

Then:

```text
[ Generate Contribution Report ]
```

The tutor-facing report shows:

```text
Recorded Evidence
+
Student Context
+
Review Suggested
```

---

# 23. Research Questions

## RQ1

> **Do students avoid reporting unequal contribution because of interpersonal conflict?**

## RQ2

> **Would students consider it fairer if contribution evidence were included by default with a group assignment submission?**

## RQ3

> **Which digital signals are useful as contribution evidence, and which are misleading?**

Examples:

```text
GitHub commits
Pull Requests
Code Reviews
Google Docs activity
Meeting attendance
Task completion
```

## RQ4

> **How should students provide context for contribution the system cannot observe?**

Examples:

```text
Interviews
Design
Presentation
Research
Offline work
Coordination
```

## RQ5

> **What information do tutors actually need when reviewing unequal contribution?**

---

# 24. Track 1 Research Story

Initial problem:

```text
How can we detect free riders?
```

After research:

```text
Students often already know when
contribution is unequal.

The larger issue is that reporting it
creates social conflict and requires
someone to become the accuser.
```

Product reframing:

```text
Original:
Contribution Radar

↓

Research

↓

New:
Automatic Contribution Evidence Report
```

Core shift:

```text
Detect a bad teammate
        ↓
Automatically document group contribution evidence
```

Final positioning:

> **Make contribution transparency a default part of group work rather than an accusation made by one student.**

---

# 25. Final MVP Definition

The MVP is complete if the team can reliably demonstrate:

```text
Create Project
      ↓
Add Members
      ↓
Map Identities
      ↓
Connect GitHub
      ↓
Connect Google Docs
      ↓
Collect Activity Evidence
      ↓
Review Member Evidence
      ↓
Add Missing Context
      ↓
Generate Contribution Report
```

The product is not:

> “Automatically decide who is free-riding.”

It is:

> **“Automatically collect contribution evidence from the tools a student team already uses and generate a transparent contribution report for instructor review.”**
