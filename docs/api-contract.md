# Slackr API Contract — MVP v1 + Approved Extensions

## General conventions

- Base URL: `/api`; requests and responses use JSON with `camelCase` fields.
- IDs are UUID strings; dates use `YYYY-MM-DD`; timestamps use ISO 8601 UTC.
- An unconnected source is `null`; a connected source with no activity has `0` counts.
- OAuth tokens and AI provider credentials remain on the server and must never be returned to the frontend.
- Recorded provider evidence, member-provided context, internal alerts, and AI output are separate data classes.

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

- `Project`: `id, name, course, groupName, deadline, memberCount, connectedSourceCount, createdAt`
- `Member`: `id, projectId, name, email, githubUsername, googleEmail, roleContext`
- `SourceConnection`: `id, projectId, sourceType, externalId, displayName, connectedAt, lastSyncedAt`
- `sourceType`: `github | googleDocs`
- `email`, `githubUsername`, `googleEmail`, `roleContext`, and `lastSyncedAt` may be `null`

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
```

The UI may suggest common roles, but the API accepts a validated non-empty custom role. Role context is interpretation context, not a contribution weight or proof that the listed work was completed.

## Project API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects` | `{ name, course, groupName, deadline }` | `201 Project` |
| `GET` | `/api/projects` | — | `200 Project[]` |
| `GET` | `/api/projects/:projectId` | — | `200 { project, members, sourceConnections }` |
| `PATCH` | `/api/projects/:projectId` | Project fields to update | `200 Project` |

## Member API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/members` | `{ name, email?, githubUsername?, googleEmail? }` | `201 Member` |
| `PATCH` | `/api/members/:memberId` | Member identity fields to update | `200 Member` |
| `DELETE` | `/api/members/:memberId` | — | `204` |

Only `name` is required. Set an identity field to `null` to remove that mapping. Role context uses a separate endpoint so its authorship remains explicit.

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

## Activity API

### `GET /api/projects/:projectId/activity`

Used by the team-only Dashboard and Member Detail views.

```json
{
  "data": {
    "projectId": "project-uuid",
    "generatedAt": "2026-08-21T02:15:00Z",
    "members": [{
      "memberId": "member-uuid",
      "name": "Kevin Liu",
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

`evidenceAlerts` are deterministic, team-only prompts. Allowed alerts cover unavailable sources, unmapped identity, missing role/context, or a transparent monitoring-window rule. They must not be named `High`/`Low`, claim overall contribution, or enter the instructor report. The team UI shows the rule and time window.

Activity counts are evidence only and must not become scores or rankings. Meetings are not implemented in MVP v1.

## Member Context API

### `GET /api/projects/:projectId/context`

Optional query: `?memberId=member-uuid`.

Response: `200 Array<{ id, projectId, memberId, contextText, submittedByUserId, submissionType, createdAt }>`.

### `POST /api/projects/:projectId/context`

Request: `{ "memberId": "member-uuid", "contextText": "..." }`

Response: `201 { id, projectId, memberId, contextText, submittedByUserId, submissionType, createdAt }`.

The server derives authorship from the verified requester.

## Deterministic Report API

### `GET /api/projects/:projectId/report`

Optional query: `?from=2026-08-01&to=2026-08-30`

```ts
type ContributionReport = {
  project: Project;
  monitoringPeriod: { from: string; to: string };
  generatedAt: string;
  connectedSources: SourceConnection[];
  members: Array<{
    memberId: string;
    name: string;
    roleContext: ReportRoleContext | null;
    evidence: {
      github: object | null;
      googleDocs: object | null;
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

The tutor-facing table, grouped bar chart, source-coverage view, and timeline are derived from this deterministic response. Source metrics stay separate: a commit is not converted into an equivalent number of document edits. Charts are rendered by the frontend, not generated as AI images.

Every evidence item that can support an AI observation exposes a stable report
reference, for example `github:commit:<sha>` or `googleDocs:activity:<id>`.
Report payloads omit internal account IDs that the instructor does not need.

The report excludes team-only `evidenceAlerts`. It contains no score, rank, `High`/`Low` label, free-rider classification, grade recommendation, or automatic verdict. PDF and CSV remain outside MVP v1.

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
      evidenceRefs: string[];
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
- roles and responsibilities stay labelled as self-reported or owner-recorded and never prove completion;
- the model may describe fewer observed events, but cannot claim lower overall contribution, rank members, identify free riders, recommend grades, or emit `High`/`Low` status;
- unsupported sources become limitations rather than invented evidence;
- provider text and member context are untrusted data, not model instructions;
- raw tokens, secrets, full document contents, and unnecessary personal data are never sent;
- use strict JSON Schema output and validate the result again at runtime;
- AI timeout, refusal, invalid output, rate limit, or missing configuration never blocks the deterministic report or visualisation;
- the UI labels output `AI-generated draft` and requires instructor review.

Provider, model, retention settings, usage limits, and consent/privacy wording must be approved before implementation. If OpenAI Responses is selected, the feature must follow current official data-control guidance and review `store: false` and available retention controls.
