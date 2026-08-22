# Slackr API Contract — MVP v1 + Approved Extensions

## General conventions

- Base URL: `/api`; requests and responses use JSON with `camelCase` fields.
- IDs are UUID strings; dates use `YYYY-MM-DD`; timestamps use ISO 8601 UTC.
- An unconnected source is `null`; a connected source with no activity has `0` counts.
- A provider failure is an explicit source state; it is neither `null` nor zero activity.
- Previously collected evidence may be returned after a provider failure only when it
  is marked stale and keeps the last successful sync time.
- OAuth tokens and AI provider credentials remain on the server and must never be returned to the frontend.
- Recorded provider evidence, member-provided context, internal alerts, and AI output are separate data classes.
- `src/types/api.ts` is the compile-time source of truth for the public shapes in
  this document. It does not export Supabase database Row types.

Successful response: `{ "data": ... }`

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Project name is required",
    "fields": { "name": "Required" }
  }
}
```

Status codes: `200` success, `201` created, `204` deleted, `400` invalid input,
`401` unauthenticated, `403` forbidden, `404` not found, `409` conflict,
`429` rate limited, `500` server error, `502` third-party API error, and `503`
temporarily unavailable.

## Authentication

- Protected endpoints use the Supabase cookie session.
- Same-origin frontend requests send cookies automatically and do not add an `Authorization` header.
- Route Handlers verify the current user from request cookies; client-supplied user or owner IDs are never authentication.
- Project-owner endpoints require ownership of the project.
- Member self-service endpoints require the authenticated user to be securely linked to that member. An unverified email match is insufficient.
- The minimal verified member-access/linking flow must be specified before self-service is implemented. Until then, owner-entered role data is labelled `projectOwnerRecorded`.

An unauthenticated protected request returns `401`:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication is required"
  }
}
```

The Google OAuth callback is a browser redirect endpoint. It validates the current Slackr session and OAuth `state`; it does not use the JSON wrapper.

## Shared data shapes

- `Project`: `id, title, deadline, memberCount, connectedSourceCount, createdAt, updatedAt`
- `Member`: `id, projectId, name, email, githubUsername, googleEmail, roleContext`
- `SourceConnection`: `id, projectId, sourceType, externalId, displayName, connectedAt, lastSyncedAt`
- `sourceType`: `github | googleDocs | googleMeet`
- `email`, `githubUsername`, `googleEmail`, `roleContext`, and `lastSyncedAt` may be `null`

`Project.updatedAt` maps directly to `projects.updated_at` and means the Project
row was updated. It does not mean a Member, Source, or Activity changed. The UI
labels it `Project updated`.

`memberCount` and `connectedSourceCount` count real rows inside the authenticated
owner's accessible Project. The UI displays `N sources connected` with no fixed
denominator. There is no Coverage field or percentage.

```ts
type MemberRoleContext = {
  memberId: string;
  primaryRole: string;
  additionalRoles: string[];
  responsibilities: string[];
  additionalContext: string | null;
  submissionType: "memberSelfReported" | "projectOwnerRecorded";
  submittedByUserId: string;
  updatedAt: string;
};

type ReportRoleContext = Omit<MemberRoleContext, "submittedByUserId">;

type SourceProviderError = {
  code: string;
  message: string;
};

type SourceState =
  | {
      sourceType: "github" | "googleDocs";
      status: "unconnected";
      connection: null;
      isStale: false;
      error: null;
    }
  | {
      sourceType: "github" | "googleDocs";
      status: "connected";
      connection: SourceConnection;
      isStale: false;
      error: null;
    }
  | {
      sourceType: "github" | "googleDocs";
      status: "failed";
      connection: SourceConnection;
      isStale: boolean;
      error: SourceProviderError;
    };
```

The UI may suggest common roles, but the API accepts a validated non-empty custom role. Role context is interpretation context, not a contribution weight or proof that the listed work was completed.

Project and Member `Active` fields do not exist. A Member identity labelled
`Connected` means only that the corresponding nullable mapping field is non-null;
it does not assert OAuth, sync, provider availability, or observed activity.

## Project API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects` | `{ title, deadline }` | `201 Project` |
| `GET` | `/api/projects` | — | `200 Project[]` |
| `GET` | `/api/projects/:projectId` | — | `200 { project, members, sourceConnections }` |
| `PATCH` | `/api/projects/:projectId` | Project fields to update | `200 Project` |

`deadline` remains required. Project List and Project Dashboard do not expose
Coverage or a Project status enum.

### Project input and response rules

`POST /api/projects` accepts exactly `title` and `deadline`. The server trims
the title and applies one limit:

- `title`: 1–120 characters.

A project is no longer tied to a course: `course` and `groupName` were dropped
so Slackr can track any group effort, not only coursework.

`deadline` must be a real calendar date in `YYYY-MM-DD` form. It is not required
to be later than the current date. The Project owner is always derived from the
verified cookie session; owner IDs, IDs, counts, and timestamps are not accepted
from the client.

`PATCH /api/projects/:projectId` accepts one or more of the same four fields and
reuses the same validation. An empty object, `null`, an unknown field, or a
client-supplied ID, owner, count, or timestamp is invalid. The database trigger,
not the client, updates `projects.updated_at`.

Project List is ordered by `updatedAt` descending and then `id` ascending. It
returns `200 { "data": [] }` when the owner has no Projects. Counts are computed
without per-Project N+1 count queries.

Project Detail returns Members ordered by database `created_at` ascending and
then `id` ascending, and Source Connections ordered by `connected_at` ascending
and then `id` ascending. These ordering columns do not add public Member fields.
Missing Member role context is `null`; empty nested collections are `[]`.
`project.memberCount` equals `members.length`, and
`project.connectedSourceCount` equals `sourceConnections.length`.

### Project error behaviour

- malformed JSON returns `400 MALFORMED_JSON`;
- invalid bodies or a non-UUID `projectId` return `400 VALIDATION_ERROR`, with
  `fields` when the failing field can be identified;
- unauthenticated requests return `401 UNAUTHENTICATED`;
- a missing Project and a Project owned by another user both return the same
  `404 PROJECT_NOT_FOUND` response; and
- database or internal failures return `500 INTERNAL_ERROR` without raw
  Supabase errors, SQL, stack traces, or internal table names.

A2 defines no Project conflict response and does not return `409` for duplicate
names. Detail and update queries remain explicitly owner-scoped even when RLS
also protects the database.

### New Project Wizard persistence

The Wizard's Project Info, Members, Connect Sources, and Review steps remain a
client-side draft until Review is confirmed. The client draft uses temporary
`draftId` strings for Member list operations; a `draftId` is never sent or treated
as a server UUID.

Review submission proceeds in this order:

1. `POST /api/projects` and store the returned `projectId`.
2. Create Members against that real Project.
3. Create non-OAuth Source records against that Project.
4. Persist the Project, Members, and remaining draft state before starting Google OAuth.
5. Resume incomplete work through the project-scoped Members or Sources page.

Review is the first server write. A partial failure preserves the created Project,
reports the successful and failed slices separately, and retries only the
incomplete slice. The client must not create a duplicate Project. MVP has no
composite Wizard endpoint.

## Member API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/members` | `{ name, email?, githubUsername?, googleEmail? }` | `201 Member` |
| `PATCH` | `/api/members/:memberId` | Member identity fields to update | `200 Member` |
| `DELETE` | `/api/members/:memberId` | — | `204` |

Only `name` is required. Set an identity field to `null` to remove that mapping. Role context uses a separate endpoint so its authorship remains explicit.

### Member input and response rules

Member request bodies are strict JSON objects. Unknown fields and client-supplied
`id`, `projectId`, `authUserId`, `roleContext`, timestamps, or status fields are
invalid. Route `projectId` and `memberId` values must be UUID strings.

The server trims every string. It preserves the submitted case of `name`, but
stores and returns non-null identity values in lowercase. Field rules are:

- `name`: 1–120 characters after trimming;
- `email`: `null` or a valid email address up to 254 characters;
- `googleEmail`: `null` or a valid email address up to 254 characters, including
  Google Workspace domains; and
- `githubUsername`: `null` or a 1–39 character GitHub username containing only
  ASCII letters, digits, and hyphens, with no leading or trailing hyphen. Profile
  URLs and values beginning with `@` are invalid.

`POST /api/projects/:projectId/members` requires `name`; omitted identity fields
are persisted as `null`. `PATCH /api/members/:memberId` requires at least one
allowed field. A field omitted from PATCH is unchanged, while an explicit `null`
removes that identity mapping. Empty strings are validation errors and are not
converted to `null`.

Member names do not need to be unique. Within one Project, non-null `email`,
`githubUsername`, and `googleEmail` values are each case-insensitively unique;
`null` values do not conflict. The same identity may be reused in a different
Project. `email` and `googleEmail` are separate identity classes, so the same
address may appear in both fields on one Member.

A same-Project identity conflict returns `409` with every conflict that can be
identified safely:

```json
{
  "error": {
    "code": "MEMBER_IDENTITY_CONFLICT",
    "message": "One or more identities are already assigned in this project",
    "fields": {
      "githubUsername": "Already assigned to another member in this project"
    }
  }
}
```

The database partial unique indexes remain the race-safe source of truth. Known
Member identity constraint violations map to this response; raw database errors,
constraint payloads, and SQL are never returned.

Member responses contain only the public `Member` fields. Manual identity values
do not assert OAuth, provider connection, successful sync, account ownership, or
observed activity. Create does not infer or set `auth_user_id` from an email.
PATCH cannot move a Member to another Project, link an authenticated user, change
role/context, or modify provider evidence. An existing `roleContext` is preserved
in the PATCH response.

### Member access, deletion, and errors

All three Member endpoints require a Supabase cookie session and Project Owner
access. The server derives ownership from the verified user and route resource;
it never accepts an owner or Project ID from a Member request body. Missing and
cross-owner Projects both return `404 PROJECT_NOT_FOUND` for nested create.
Missing and cross-owner Members both return `404 MEMBER_NOT_FOUND` for PATCH and
DELETE. RLS remains defense in depth in addition to explicit owner-scoped Route
Handler checks and mutations.

Successful DELETE performs one Member deletion and returns an empty-body `204`.
Deleting the same Member again returns `404 MEMBER_NOT_FOUND`. The existing
foreign keys define the deletion result:

- GitHub and Google Docs activity rows remain, with `member_id` set to `null`;
- Member Context and Member Role Context rows are cascade-deleted; and
- Source Connections, other Members, and their evidence are unchanged.

Member create and delete change the real `memberCount` returned by subsequent
Project reads. Member mutations do not update `projects.updated_at`, so they do
not change public `Project.updatedAt` semantics.

Member endpoint errors use these stable behaviours:

- malformed JSON: `400 MALFORMED_JSON`;
- invalid UUID, body, empty PATCH, email, or GitHub username:
  `400 VALIDATION_ERROR`, with field details when available;
- unauthenticated: `401 UNAUTHENTICATED`;
- inaccessible nested Project: `404 PROJECT_NOT_FOUND`;
- inaccessible Member: `404 MEMBER_NOT_FOUND`;
- duplicate identity: `409 MEMBER_IDENTITY_CONFLICT`; and
- unexpected database or internal failure: `500 INTERNAL_ERROR` with a fixed,
  safe message.

## Member Role Context API — approved MVP+ extension

### `PUT /api/members/:memberId/role-context`

Request:

```json
{
  "primaryRole": "Backend Developer",
  "additionalRoles": ["Project Coordinator"],
  "responsibilities": [
    "Design backend APIs",
    "Implement provider integrations",
    "Coordinate the frontend API contract"
  ],
  "additionalContext": null
}
```

Response: `200 MemberRoleContext`.

The authenticated member may update only their linked member record. The owner may record data on behalf of a member, but the server derives `submissionType`; the client cannot choose it.

## Source API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/sources/github` | `{ repositoryUrl }` | `201 SourceConnection` |
| `POST` | `/api/projects/:projectId/sources/google` | `{ documentUrl }` | `200 { authorizationUrl }` |
| `GET` | `/api/integrations/google/callback` | Google OAuth callback parameters | `302` to `/projects/:projectId/sources` |

GitHub supports public repositories only in MVP v1. Google connection uses a server-side authorisation-code flow; provider tokens never appear in API responses. Disconnect and manual resync are outside MVP v1.

### A4 initiation rules

`POST /api/projects/:projectId/sources/github` accepts only a strict JSON object
with `repositoryUrl`. The URL must be an HTTPS `github.com` repository URL with
exactly owner/repository path segments, no credentials, port, query, fragment,
or extra segment. A trailing slash or `.git` suffix is removed. The server
anonymously verifies the repository through GitHub's repository metadata API and
persists only the provider-confirmed lowercase `externalId`, canonical
`displayName`, and `lastSyncedAt: null`. After the source row is created, the
server immediately performs a bounded initial GitHub commit collection using the
persisted repository identity. The source is still returned to the client if that
first sync cannot finish; in that case `lastSyncedAt` remains `null` until a
later successful sync completes.

`POST /api/projects/:projectId/sources/google` accepts only `documentUrl`. It
requires an HTTPS `docs.google.com/document/d/{documentId}` URL, strips
query/fragment and presentation suffixes, and preserves the document ID case.
It creates a ten-minute, one-time, server-trusted OAuth intent and returns only
`200 { data: { authorizationUrl } }`; it does not create a SourceConnection or
increase `connectedSourceCount`. The callback remains an A6 implementation gate.

Each Project may have at most one source of each supported type. A duplicate
external source returns `409 SOURCE_ALREADY_CONNECTED`; a different source of
the same type returns `409 SOURCE_TYPE_ALREADY_CONNECTED`. The database
constraint is the race-safe source of truth. Invalid input returns
`400 VALIDATION_ERROR`, inaccessible Projects return `404 PROJECT_NOT_FOUND`,
GitHub inaccessible repositories return `404 GITHUB_REPOSITORY_NOT_ACCESSIBLE`,
GitHub rate limits return `429 GITHUB_RATE_LIMITED`, upstream/network failures
return `502 GITHUB_PROVIDER_ERROR`, missing Google configuration returns
`503 GOOGLE_OAUTH_NOT_CONFIGURED`, and intent-store failure returns
`503 GOOGLE_OAUTH_TEMPORARILY_UNAVAILABLE`.

Source status is reported separately from identity mapping:

- `unconnected`: no `SourceConnection` and no evidence;
- `connected`: a connection exists; zero activity is valid; and
- `failed`: a connection exists, but provider collection failed and a safe public
  error is present.

`lastSyncedAt` is the last successful sync time, not a Member activity time. If
previously collected evidence is returned with a failed source, `isStale` is
`true`. If no previous evidence is returned, `isStale` is `false` and the
corresponding activity slice is `null`.

## Activity API

### `GET /api/projects/:projectId/activity`

Used by the team-only Dashboard and Member Detail views.

```json
{
  "data": {
    "projectId": "project-uuid",
    "generatedAt": "2026-08-21T02:15:00Z",
    "sourceStates": {
      "github": {
        "sourceType": "github",
        "status": "connected",
        "connection": {
          "id": "github-connection-uuid",
          "projectId": "project-uuid",
          "sourceType": "github",
          "externalId": "group7/final-project",
          "displayName": "group7/final-project",
          "connectedAt": "2026-08-20T01:00:00Z",
          "lastSyncedAt": "2026-08-21T02:00:00Z"
        },
        "isStale": false,
        "error": null
      },
      "googleDocs": {
        "sourceType": "googleDocs",
        "status": "connected",
        "connection": {
          "id": "docs-connection-uuid",
          "projectId": "project-uuid",
          "sourceType": "googleDocs",
          "externalId": "document-id",
          "displayName": "Final Project Report",
          "connectedAt": "2026-08-20T01:10:00Z",
          "lastSyncedAt": "2026-08-21T02:05:00Z"
        },
        "isStale": false,
        "error": null
      }
    },
    "members": [{
      "memberId": "member-uuid",
      "name": "Kevin Liu",
      "lastActiveAt": "2026-08-13T04:20:00Z",
      "github": { "commitCount": 2, "lastActiveAt": "2026-08-12T05:10:00Z" },
      "googleDocs": {
        "activityCount": 3,
        "editCount": 3,
        "commentCount": 0,
        "suggestionCount": 0,
        "lastActiveAt": "2026-08-13T04:20:00Z"
      },
      "evidenceAlerts": [{
        "code": "NO_RECENT_OBSERVED_ACTIVITY",
        "level": "attention",
        "message": "No activity was observed in connected sources during the configured window.",
        "sourceTypes": ["github", "googleDocs"]
      }]
    }]
  }
}
```

`sourceStates` always contains both supported public source keys, `github` and
`googleDocs`, so a caller does not infer unconnected or failed state from a
missing property.

For each Member, top-level `lastActiveAt` is the latest non-null per-source
`lastActiveAt`, or `null` when no supported source has observed activity. The
server computes it. Per-source timestamps remain in the response.

When a source is unconnected, that Member source summary is `null`. When it is
connected with no mapped activity, the summary exists with zero counts and
`lastActiveAt: null`. When a provider fails, `sourceStates` carries the failure;
the summary is either `null` or explicitly stale data according to `isStale`.

`evidenceAlerts` are deterministic, team-only prompts. Allowed alerts cover unavailable sources, unmapped identity, missing role/context, or a transparent monitoring-window rule. They must not be named `High`/`Low`, claim overall contribution, or enter the instructor report. The team UI shows the rule and time window.

Activity counts are evidence only and must not become scores or rankings. Meetings are not implemented in MVP v1.

## Member Context API

### `GET /api/projects/:projectId/context`

Optional query: `?memberId=member-uuid`.

Response: `200 Array<{ id, projectId, memberId, contextText, submittedByUserId, submissionType, createdAt }>`.

No matching context returns an empty array `[]`, not `null`.

### `POST /api/projects/:projectId/context`

Request: `{ "memberId": "member-uuid", "contextText": "..." }`

Response: `201 { id, projectId, memberId, contextText, submittedByUserId, submissionType, createdAt }`.

The server derives `submittedByUserId` and `submissionType` from the verified
requester; the client cannot choose either field. Member self-service requires a
verified member-account link. Until that flow exists, owner-created entries are
`projectOwnerRecorded`.

Team-facing context retains the internal submitter user ID. Tutor-facing report
context retains `submissionType` and `createdAt` but omits `submittedByUserId`.
Role context and missing-work context remain separate authored data classes.

## Deterministic Report API

### `GET /api/projects/:projectId/report`

Optional query: `?from=2026-08-01&to=2026-08-30`

```ts
type GithubReportEvidence = {
  commitCount: number;
  lastActiveAt: string | null;
  items: Array<{
    evidenceRef: `github:commit:${string}`;
    sha: string;
    message: string;
    timestamp: string;
  }>;
};

type GoogleDocsReportEvidence = {
  activityCount: number;
  editCount: number;
  commentCount: number;
  suggestionCount: number;
  lastActiveAt: string | null;
  items: Array<{
    evidenceRef: `googleDocs:activity:${string}`;
    id: string;
    activityType: "edit" | "comment" | "suggestion";
    timestamp: string;
  }>;
};

type ContributionReport = {
  project: Project;
  monitoringPeriod: { from: string; to: string };
  generatedAt: string;
  connectedSources: SourceConnection[];
  sourceStates: Record<"github" | "googleDocs", SourceState>;
  members: Array<{
    memberId: string;
    name: string;
    roleContext: ReportRoleContext | null;
    evidence: {
      github: GithubReportEvidence | null;
      googleDocs: GoogleDocsReportEvidence | null;
    };
    context: Array<{
      id: string;
      contextText: string;
      submissionType: "memberSelfReported" | "projectOwnerRecorded";
      createdAt: string;
    }>;
  }>;
  disclaimer: string;
};
```

The tutor-facing table, grouped bar chart, named source-state view, and timeline
are derived from this deterministic response. Source metrics stay separate: a
commit is not converted into an equivalent number of document edits. Charts are
rendered by the frontend, not generated as AI images.

Unconnected report evidence is `null`. Connected zero-activity evidence contains
zero counts and an empty `items` array. A failed source is represented in
`sourceStates`; any retained evidence must follow the `isStale` rule.

Every evidence item that can support an AI observation exposes a stable report
reference, for example `github:commit:<sha>` or `googleDocs:activity:<id>`.
Report payloads omit internal account IDs that the instructor does not need.

The report excludes team-only `evidenceAlerts` and internal
`submittedByUserId` values. It contains no Meet data, pull-request/issue/
repository/code-review metrics, unsupported document count, Coverage, Active,
score, rank, `High`/`Low` label, free-rider classification, grade recommendation,
or automatic verdict. PDF and CSV remain outside MVP v1.

## Application routes and session display

Global routes are `/projects` and `/projects/new`. The following routes require a
current `projectId`:

- `/projects/:projectId`
- `/projects/:projectId/members`
- `/projects/:projectId/sources`
- `/projects/:projectId/report`
- `/projects/:projectId/members/:memberId`

Slackr does not expose global Reports, Members, Connections, or Settings routes
in MVP. Project-scoped navigation items are hidden when no current Project
exists, and Settings remains hidden.

The UserChip displays a non-empty `full_name` or `name` from the authenticated
session metadata, then falls back to the session email. Display metadata is not
an authorisation source. The server continues to authorise with the verified
user ID. A1.5 adds no profiles table or profile API.

## AI Evidence Summary API — optional stretch goal

### `POST /api/projects/:projectId/report/ai-summary`

Optional query: `?from=2026-08-01&to=2026-08-30`.

The client does not upload a report. The server authorises the request, builds the canonical deterministic report, minimises the fields sent to the configured model provider, and requests a strict schema-conforming response.

```ts
type AiEvidenceSummary = {
  generatedAt: string;
  overview: string;
  memberObservations: Array<{
    memberId: string;
    roleContextUsed: boolean;
    observations: Array<{
      text: string;
      evidenceRefs: Array<
        | `github:commit:${string}`
        | `googleDocs:activity:${string}`
      >;
    }>;
    missingContext: string[];
  }>;
  limitations: string[];
  disclaimer: string;
  reviewRequired: true;
};
```

Rules:

- every material observation includes stable `evidenceRefs` or is omitted;
- team-only `evidenceAlerts` are not included in the canonical report or AI input;
- roles and responsibilities stay labelled as self-reported or owner-recorded and never prove completion;
- the model may describe fewer observed events, but cannot claim lower overall contribution, rank members, identify free riders, recommend grades, or emit `High`/`Low` status;
- unsupported sources become limitations rather than invented evidence;
- provider text and member context are untrusted data, not model instructions;
- raw tokens, secrets, full document contents, and unnecessary personal data are never sent;
- use strict JSON Schema output and validate the result again at runtime;
- AI timeout, refusal, invalid output, rate limit, or missing configuration never blocks the deterministic report or visualisation;
- the UI labels output `AI-generated draft` and requires instructor review.

Provider, model, retention settings, usage limits, and consent/privacy wording must be approved before implementation. If OpenAI Responses is selected, the feature must follow current official data-control guidance and review `store: false` and available retention controls.
