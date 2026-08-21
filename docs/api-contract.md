# Slackr API Contract — MVP v1

## General conventions

- Base URL: `/api`; requests and responses use JSON with `camelCase` fields.
- IDs are UUID strings; dates use `YYYY-MM-DD`; timestamps use ISO 8601 UTC.
- An unconnected source is `null`; a connected source with no activity has `0` counts.
- OAuth tokens remain on the server and must never be returned to the frontend.

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
`500` server error, and `502` third-party API error.

## Authentication

- Protected endpoints use the Supabase cookie session.
- Same-origin frontend requests send cookies automatically and do not add an
  `Authorization` header.
- Route Handlers verify the current user from the request cookies. A user or
  owner ID supplied by the client is never accepted as authentication.
- An unauthenticated protected request returns `401`:

```json
{
  "error": {
    "code": "UNAUTHENTICATED",
    "message": "Authentication is required"
  }
}
```

The Google OAuth callback is a browser redirect endpoint. It validates both the
current Slackr session and OAuth `state`; it does not use the standard JSON
response wrapper.

## Shared data shapes

- `Project`: `id, name, course, groupName, deadline, memberCount, connectedSourceCount, createdAt`
- `Member`: `id, projectId, name, email, githubUsername, googleEmail`
- `SourceConnection`: `id, projectId, sourceType, externalId, displayName, connectedAt, lastSyncedAt`
- `sourceType`: `github | googleDocs`
- `email`, `githubUsername`, `googleEmail`, and `lastSyncedAt` may be `null`

## Project API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects` | `{ name, course, groupName, deadline }` | `201 Project` |
| `GET` | `/api/projects` | — | `200 Project[]` |
| `GET` | `/api/projects/:projectId` | — | `200 { project, members, sourceConnections }` |
| `PATCH` | `/api/projects/:projectId` | Project fields to update | `200 Project` |

Create project example:

```json
{
  "name": "COMP30022 Final Project",
  "course": "COMP30022",
  "groupName": "Group 7",
  "deadline": "2026-08-30"
}
```

## Member API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/members` | `{ name, email?, githubUsername?, googleEmail? }` | `201 Member` |
| `PATCH` | `/api/members/:memberId` | Member fields to update | `200 Member` |
| `DELETE` | `/api/members/:memberId` | — | `204` |

Only `name` is required. Set an identity field to `null` to remove that mapping.

## Source API

| Method | Path | Request | Response |
|---|---|---|---|
| `POST` | `/api/projects/:projectId/sources/github` | `{ repositoryUrl }` | `201 SourceConnection` |
| `POST` | `/api/projects/:projectId/sources/google` | `{ documentUrl }` | `200 { authorizationUrl }` |
| `GET` | `/api/integrations/google/callback` | Google OAuth callback parameters | `302` to `/projects/:projectId/sources` |

GitHub connections support public repositories only in MVP v1 and do not use
GitHub OAuth or provider tokens.

The Google source request validates the authenticated user's project access and
the document URL, stores a short-lived signed connection intent, and returns a
Google OAuth authorisation URL. The callback validates the session and OAuth
state, exchanges the code on the server, verifies document access, creates the
`SourceConnection`, performs the initial activity collection, and redirects to
the project source page. Google tokens never appear in API responses.

Disconnect-source and manual-resync endpoints are not part of MVP v1.

## Activity API

### `GET /api/projects/:projectId/activity`

Used by the Project Dashboard and Member Detail views.

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
      "meetings": null
    }]
  }
}
```

Activity counts are evidence only and must not become contribution scores or rankings. Meetings are not implemented in MVP v1.

## Member Context API

### `POST /api/projects/:projectId/context`

Request: `{ "memberId": "member-uuid", "contextText": "..." }`

Response: `201 { id, projectId, memberId, contextText, createdAt }`

## Report API

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
    evidence: {
      github: object | null;
      googleDocs: object | null;
      meetings: null;
    };
    context: Array<{ id: string; contextText: string; createdAt: string }>;
  }>;
  disclaimer: string;
};
```

MVP v1 returns JSON only. It does not generate PDFs, contribution scores, automatic judgements, or AI judgements.
