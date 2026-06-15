# Glinteco e-Learning — API Request / Response Examples

> Example payloads for every endpoint in [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) §5.
> Base URL: `https://api.glinteco-elearning.dev/api/v1`. Auth routes aside, every request sends
> `Authorization: Bearer <accessToken>`. Dates are ISO-8601 UTC. Example data is synthetic.

**Conventions used below**
- List responses: `{ "data": [...], "nextCursor": "<opaque|null>", "hasMore": <bool> }`
- Errors: `{ "statusCode": <int>, "message": "<string|string[]>", "error": "<string>" }`
- `:id` path params shown with sample UUIDs.

---

## 1. Auth & session

### POST `/auth/register`
**Request**
```json
{
  "name": "Ada Lovelace",
  "email": "ada@acme.dev",
  "password": "hunter2-very-strong"
}
```
**Response** `201 Created`
```json
{
  "user": {
    "id": "u_8f3a1c20",
    "name": "Ada Lovelace",
    "email": "ada@acme.dev",
    "role": "learner",
    "level": 1,
    "xp": 0,
    "cohortId": "c_spring2026"
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni…",
  "refreshToken": "rt_a1b2c3d4e5f6",
  "expiresIn": 900
}
```

### POST `/auth/login`
**Request**
```json
{ "email": "mina@acme.dev", "password": "••••••••", "rememberMe": true }
```
**Response** `200 OK`
```json
{
  "user": {
    "id": "u_mina01",
    "name": "Mina Okonkwo",
    "role": "learner",
    "title": "Frontend Engineer",
    "level": 3,
    "xp": 1240
  },
  "accessToken": "eyJhbGciOiJIUzI1Ni…",
  "refreshToken": "rt_9z8y7x6w",
  "expiresIn": 900
}
```
**Error** `401 Unauthorized`
```json
{ "statusCode": 401, "message": "Invalid email or password", "error": "Unauthorized" }
```

### POST `/auth/google`
**Request**
```json
{ "idToken": "google-oauth2-id-token-here" }
```
**Response** `200 OK` — same shape as `/auth/login`. New Google users are auto-provisioned as `learner`.

### POST `/auth/refresh`
**Request**
```json
{ "refreshToken": "rt_9z8y7x6w" }
```
**Response** `200 OK`
```json
{ "accessToken": "eyJhbGciOiJIUzI1Ni…", "refreshToken": "rt_new1234", "expiresIn": 900 }
```

### POST `/auth/logout`
**Request** — body optional; refresh token revoked from header/cookie.
**Response** `204 No Content`

### POST `/auth/forgot-password`
**Request**
```json
{ "email": "mina@acme.dev" }
```
**Response** `202 Accepted`
```json
{ "message": "If the account exists, a reset link has been sent." }
```

### POST `/auth/reset-password`
**Request**
```json
{ "token": "reset_tok_abc123", "password": "new-strong-password" }
```
**Response** `200 OK`
```json
{ "message": "Password updated. Please sign in." }
```

### GET `/auth/me`
**Response** `200 OK`
```json
{
  "id": "u_mina01",
  "name": "Mina Okonkwo",
  "email": "mina@acme.dev",
  "role": "learner",
  "title": "Frontend Engineer",
  "avatarHue": 162,
  "level": 3,
  "xp": 1240,
  "streakDays": 6,
  "cohortId": "c_spring2026",
  "joinedAt": "2026-04-02T09:00:00Z"
}
```

---

## 2. Users & profile

### GET `/users?cohortId=c_spring2026&role=learner&limit=20`  *(admin)*
**Response** `200 OK`
```json
{
  "data": [
    { "id": "u_mina01", "name": "Mina Okonkwo", "role": "learner",
      "level": 3, "xp": 1240, "completion": 46, "avatarHue": 162 },
    { "id": "u_raj02", "name": "Raj Patel", "role": "learner",
      "level": 2, "xp": 720, "completion": 31, "avatarHue": 40 }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2…",
  "hasMore": true
}
```

### GET `/users/u_mina01`
**Response** `200 OK`
```json
{
  "id": "u_mina01", "name": "Mina Okonkwo", "role": "learner",
  "title": "Frontend Engineer", "level": 3, "xp": 1240, "streakDays": 6,
  "cohortId": "c_spring2026", "joinedAt": "2026-04-02T09:00:00Z"
}
```
**Error** `403 Forbidden` (learner requesting another user)
```json
{ "statusCode": 403, "message": "You may only access your own profile", "error": "Forbidden" }
```

### PATCH `/users/me`
**Request**
```json
{ "title": "Senior Frontend Engineer", "avatarHue": 200 }
```
**Response** `200 OK`
```json
{ "id": "u_mina01", "title": "Senior Frontend Engineer", "avatarHue": 200 }
```

### GET `/users/me/stats`  *(learner dashboard)*
**Response** `200 OK`
```json
{
  "level": 3,
  "xp": 1240,
  "xpThisWeek": 180,
  "streakDays": 6,
  "overallCompletion": 46,
  "tracks": { "completed": 2, "total": 5 },
  "exercises": { "approved": 1, "total": 3, "awaitingReview": 1 },
  "savedDocs": { "total": 12, "unread": 3 }
}
```

---

## 3. Cohorts (admin analytics)

### GET `/cohorts`
**Response** `200 OK`
```json
{
  "data": [
    { "id": "c_spring2026", "name": "Spring 2026", "learnerCount": 14, "avgCompletion": 58 }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

### GET `/cohorts/c_spring2026`
**Response** `200 OK`
```json
{
  "id": "c_spring2026", "name": "Spring 2026", "learnerCount": 14,
  "avgCompletion": 58, "avgRampDays": 11, "targetRampDays": 14,
  "createdAt": "2026-03-01T00:00:00Z"
}
```

### GET `/cohorts/c_spring2026/overview`  *(admin dashboard cards)*
**Response** `200 OK`
```json
{
  "activeLearners": 14,
  "newThisWeek": 3,
  "avgCompletion": 58,
  "avgCompletionDelta": 12,
  "pendingReview": 3,
  "oldestPendingAgo": "3h",
  "avgRampDays": 11,
  "targetRampDays": 14
}
```

### GET `/cohorts/c_spring2026/track-completion`
**Response** `200 OK`
```json
{
  "data": [
    { "trackId": "t1", "title": "Local Dev Environment", "completionPct": 92 },
    { "trackId": "t2", "title": "Frontend Fundamentals", "completionPct": 74 },
    { "trackId": "t3", "title": "NestJS Service Layer", "completionPct": 51 },
    { "trackId": "t4", "title": "System Architecture", "completionPct": 23 },
    { "trackId": "t5", "title": "Testing & CI Pipeline", "completionPct": 9 }
  ]
}
```

### GET `/cohorts/c_spring2026/export`
**Response** `200 OK` — `Content-Type: text/csv`
```csv
name,email,completion,xp,level,tracksCompleted,exercisesApproved
Mina Okonkwo,mina@acme.dev,46,1240,3,2,1
Raj Patel,raj@acme.dev,31,720,2,1,0
```

---

## 4. Tracks & lessons

### GET `/tracks`  *(includes caller's per-track status)*
**Response** `200 OK`
```json
{
  "data": [
    { "id": "t1", "title": "Local Dev Environment", "estimatedTime": "1.5h",
      "order": 1, "lessonCount": 4, "icon": "device-laptop", "status": "completed",
      "description": "Clone the monorepo, install pnpm, run the dev stack with Docker Compose." },
    { "id": "t3", "title": "NestJS Service Layer", "estimatedTime": "2.5h",
      "order": 3, "lessonCount": 5, "icon": "server", "status": "in_progress",
      "lessonsCompleted": 3,
      "description": "Modules, providers, DTO validation, and how we structure controllers." },
    { "id": "t4", "title": "System Architecture", "estimatedTime": "2h",
      "order": 4, "lessonCount": 4, "icon": "sitemap", "status": "locked",
      "description": "Event-driven boundaries, the gateway pattern, and our data contracts." }
  ]
}
```

### GET `/tracks/t3`
**Response** `200 OK`
```json
{
  "id": "t3", "title": "NestJS Service Layer", "estimatedTime": "2.5h",
  "order": 3, "icon": "server", "status": "in_progress", "lessonsCompleted": 3,
  "description": "Modules, providers, DTO validation, and how we structure controllers.",
  "lessons": [
    { "id": "l31", "title": "Modules & Providers", "order": 1, "completed": true },
    { "id": "l32", "title": "DTO Validation", "order": 2, "completed": true },
    { "id": "l33", "title": "Controllers & Routing", "order": 3, "completed": true },
    { "id": "l34", "title": "Guards & Interceptors", "order": 4, "completed": false },
    { "id": "l35", "title": "Service Testing", "order": 5, "completed": false }
  ]
}
```

### POST `/tracks`  *(admin)*
**Request**
```json
{
  "title": "GraphQL Gateway",
  "description": "Federated schema, resolvers, and the gateway pattern.",
  "estimatedTime": "2h",
  "lessonCount": 4,
  "afterTrackId": "t4"
}
```
**Response** `201 Created`
```json
{ "id": "t6", "title": "GraphQL Gateway", "order": 5, "status": "locked",
  "estimatedTime": "2h", "lessonCount": 4 }
```

### PATCH `/tracks/t6`  *(admin)*
**Request**
```json
{ "title": "GraphQL Federation Gateway", "estimatedTime": "3h" }
```
**Response** `200 OK`
```json
{ "id": "t6", "title": "GraphQL Federation Gateway", "estimatedTime": "3h" }
```

### DELETE `/tracks/t6`  *(admin)*
**Response** `204 No Content`

### PATCH `/tracks/reorder`  *(admin)*
**Request**
```json
{ "order": ["t1", "t2", "t3", "t6", "t4", "t5"] }
```
**Response** `200 OK`
```json
{ "message": "Tracks reordered", "count": 6 }
```

### GET `/tracks/t3/lessons`
**Response** `200 OK`
```json
{
  "data": [
    { "id": "l31", "title": "Modules & Providers", "order": 1, "estimatedTime": "30m" },
    { "id": "l32", "title": "DTO Validation", "order": 2, "estimatedTime": "30m" }
  ]
}
```

### POST `/tracks/t3/lessons`  *(admin)*
**Request**
```json
{ "title": "Pagination Patterns", "order": 6, "estimatedTime": "30m", "body": "# Keyset pagination…" }
```
**Response** `201 Created`
```json
{ "id": "l36", "trackId": "t3", "title": "Pagination Patterns", "order": 6 }
```

### PATCH `/lessons/l36`  *(admin)*
**Request**
```json
{ "title": "Cursor Pagination Patterns" }
```
**Response** `200 OK`
```json
{ "id": "l36", "title": "Cursor Pagination Patterns" }
```

### DELETE `/lessons/l36`  *(admin)*
**Response** `204 No Content`

### POST `/lessons/l34/complete`  *(learner)*
**Request** — empty body.
**Response** `200 OK`
```json
{
  "lessonId": "l34",
  "trackId": "t3",
  "lessonsCompleted": 4,
  "trackStatus": "in_progress",
  "xpAwarded": 40,
  "totalXp": 1280,
  "unlockedTrackId": null
}
```
> When the final lesson completes, `trackStatus` becomes `"completed"` and `unlockedTrackId`
> names the next track (e.g. `"t4"`).

---

## 5. Documents & tags

### GET `/documents?q=auth&tags=NestJS,Architecture&kind=Guide&limit=20`
**Response** `200 OK`
```json
{
  "data": [
    { "id": "d5", "title": "Service Auth & JWT Flow", "url": "wiki/backend/auth",
      "kind": "Guide", "tags": ["NestJS", "Architecture"], "updatedAt": "2026-06-15T03:00:00Z",
      "bookmarked": true }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

### GET `/documents/recent`  *(learner dashboard)*
**Response** `200 OK`
```json
{
  "data": [
    { "id": "d5", "title": "Service Auth & JWT Flow", "tags": ["NestJS", "Architecture"] },
    { "id": "d3", "title": "NestJS Module Boundaries", "tags": ["NestJS", "Architecture"] },
    { "id": "d1", "title": "Next.js App Router Conventions", "tags": ["Frontend", "Architecture"] }
  ]
}
```

### GET `/documents/d5`
**Response** `200 OK`
```json
{
  "id": "d5", "title": "Service Auth & JWT Flow", "url": "wiki/backend/auth",
  "kind": "Guide", "tags": ["NestJS", "Architecture"],
  "updatedAt": "2026-06-15T03:00:00Z", "bookmarked": true
}
```

### POST `/documents`  *(admin)*
**Request**
```json
{
  "title": "Caching Strategy Guide",
  "url": "wiki/backend/caching",
  "kind": "Guide",
  "tags": ["NestJS", "DevOps"]
}
```
**Response** `201 Created`
```json
{ "id": "d9", "title": "Caching Strategy Guide", "url": "wiki/backend/caching",
  "kind": "Guide", "tags": ["NestJS", "DevOps"], "updatedAt": "2026-06-15T11:20:00Z" }
```

### PATCH `/documents/d9`  *(admin)*
**Request**
```json
{ "kind": "Runbook", "tags": ["DevOps"] }
```
**Response** `200 OK`
```json
{ "id": "d9", "kind": "Runbook", "tags": ["DevOps"] }
```

### DELETE `/documents/d9`  *(admin)*
**Response** `204 No Content`

### POST `/documents/d5/bookmark`  *(learner)*
**Response** `200 OK`
```json
{ "documentId": "d5", "bookmarked": true }
```

### DELETE `/documents/d5/bookmark`  *(learner)*
**Response** `204 No Content`

### GET `/tags`
**Response** `200 OK`
```json
{
  "data": [
    { "id": "tag_fe", "name": "Frontend", "color": "accent" },
    { "id": "tag_nest", "name": "NestJS", "color": "info" },
    { "id": "tag_arch", "name": "Architecture", "color": "warn" },
    { "id": "tag_test", "name": "Testing", "color": "muted" },
    { "id": "tag_devops", "name": "DevOps", "color": "danger" },
    { "id": "tag_db", "name": "Database", "color": "info" }
  ]
}
```

### POST `/tags`  *(admin)*
**Request**
```json
{ "name": "GraphQL" }
```
**Response** `201 Created`
```json
{ "id": "tag_gql", "name": "GraphQL", "color": "accent" }
```
**Error** `409 Conflict`
```json
{ "statusCode": 409, "message": "Tag \"GraphQL\" already exists", "error": "Conflict" }
```

### DELETE `/tags/tag_gql`  *(admin)*
**Response** `204 No Content`

---

## 6. Exercises

### GET `/exercises?trackId=t3&difficulty=Intermediate`  *(includes caller's status)*
**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "e2", "title": "Add a Paginated Users Endpoint",
      "trackId": "t3", "track": "NestJS Service Layer", "tag": "NestJS",
      "difficulty": "Intermediate", "estimatedTime": "3h", "xp": 200,
      "brief": "Implement GET /users with cursor pagination, DTO validation, and a unit test.",
      "objectiveCount": 4,
      "status": "submitted",
      "prUrl": "github.com/acme/api/pull/119"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

### GET `/exercises/e2`  *(full detail)*
**Response** `200 OK`
```json
{
  "id": "e2",
  "title": "Add a Paginated Users Endpoint",
  "trackId": "t3", "track": "NestJS Service Layer", "tag": "NestJS",
  "difficulty": "Intermediate", "estimatedTime": "3h", "xp": 200,
  "brief": "Implement GET /users with cursor pagination, DTO validation, and a unit test for the service.",
  "overview": "Cursor pagination is our standard for every list endpoint. You will build one end-to-end…",
  "objectives": [
    "GET /users accepts ?cursor and ?limit (max 50)",
    "Response includes nextCursor and hasMore",
    "Invalid params return 400 via class-validator DTO",
    "Service unit test covers empty, partial and full pages"
  ],
  "steps": [
    "Add the PaginationQueryDto with validation decorators",
    "Implement keyset pagination in UsersService.list()",
    "Write the Jest spec for the service",
    "Open a PR and paste the link below"
  ],
  "resources": [
    { "id": "d3", "title": "NestJS Module Boundaries" },
    { "id": "d5", "title": "Service Auth & JWT Flow" }
  ],
  "hint": "Keyset beats OFFSET here — order by (createdAt, id) and encode both into the cursor.",
  "status": "submitted",
  "prUrl": "github.com/acme/api/pull/119"
}
```

### POST `/exercises`  *(admin)*
**Request**
```json
{
  "title": "Service Auth Middleware",
  "trackId": "t3",
  "tag": "NestJS",
  "difficulty": "Intermediate",
  "estimatedTime": "2h",
  "xp": 180,
  "brief": "Add a JWT guard that attaches the user to the request.",
  "overview": "Every protected route runs through this guard…",
  "objectives": ["Verify JWT signature", "Attach user to request", "401 on invalid token"],
  "steps": ["Create the guard", "Register it globally", "Write the spec"],
  "resourceDocIds": ["d5"],
  "hint": "Reuse the shared JwtService config."
}
```
**Response** `201 Created`
```json
{ "id": "e4", "title": "Service Auth Middleware", "trackId": "t3", "xp": 180, "status": "pending" }
```

### PATCH `/exercises/e4`  *(admin)*
**Request**
```json
{ "xp": 200, "difficulty": "Advanced" }
```
**Response** `200 OK`
```json
{ "id": "e4", "xp": 200, "difficulty": "Advanced" }
```

### DELETE `/exercises/e4`  *(admin)*
**Response** `204 No Content`

---

## 7. Submissions & review

### POST `/exercises/e3/submissions`  *(learner — first submit)*
**Request**
```json
{ "prUrl": "github.com/acme/web/pull/468" }
```
**Response** `201 Created`
```json
{
  "id": "s_5f2a",
  "exerciseId": "e3",
  "userId": "u_mina01",
  "prUrl": "github.com/acme/web/pull/468",
  "status": "submitted",
  "submittedAt": "2026-06-15T11:25:00Z"
}
```
**Error** `400 Bad Request`
```json
{ "statusCode": 400, "message": ["prUrl must be a valid URL"], "error": "Bad Request" }
```

### PUT `/exercises/e3/submissions`  *(learner — re-submit)*
**Request**
```json
{ "prUrl": "github.com/acme/web/pull/470" }
```
**Response** `200 OK`
```json
{
  "id": "s_5f2a", "exerciseId": "e3", "status": "submitted",
  "prUrl": "github.com/acme/web/pull/470", "submittedAt": "2026-06-15T11:40:00Z"
}
```

### GET `/submissions?status=submitted`  *(admin review feed)*
**Response** `200 OK`
```json
{
  "data": [
    { "id": "s1", "user": { "id": "u_mina01", "name": "Mina Okonkwo", "avatarHue": 162 },
      "exercise": "Add a Paginated Users Endpoint", "prUrl": "github.com/acme/api/pull/119",
      "status": "submitted", "submittedAt": "2026-06-15T11:11:00Z" },
    { "id": "s2", "user": { "id": "u_raj02", "name": "Raj Patel", "avatarHue": 40 },
      "exercise": "Build a Profile Card Component", "prUrl": "github.com/acme/web/pull/477",
      "status": "submitted", "submittedAt": "2026-06-15T10:25:00Z" }
  ],
  "nextCursor": "eyJzdWJtaXR0ZWRBdCI6…",
  "hasMore": true
}
```

### GET `/submissions/mine`  *(learner)*
**Response** `200 OK`
```json
{
  "data": [
    { "id": "s1", "exerciseId": "e2", "exercise": "Add a Paginated Users Endpoint",
      "prUrl": "github.com/acme/api/pull/119", "status": "submitted",
      "submittedAt": "2026-06-15T11:11:00Z" }
  ]
}
```

### GET `/submissions/s1`
**Response** `200 OK`
```json
{
  "id": "s1", "exerciseId": "e2", "exercise": "Add a Paginated Users Endpoint",
  "user": { "id": "u_mina01", "name": "Mina Okonkwo" },
  "prUrl": "github.com/acme/api/pull/119",
  "status": "submitted",
  "reviewerId": null, "reviewNote": null,
  "submittedAt": "2026-06-15T11:11:00Z", "reviewedAt": null
}
```

### POST `/submissions/s1/approve`  *(admin)*
**Request** — optional `{ "note": "Clean keyset impl, nice tests." }`
**Response** `200 OK`
```json
{
  "id": "s1", "status": "approved",
  "exerciseId": "e2", "exerciseStatus": "approved",
  "reviewerId": "u_lead", "reviewedAt": "2026-06-15T11:50:00Z",
  "xpAwarded": 200, "learnerTotalXp": 1440
}
```

### POST `/submissions/s2/request-changes`  *(admin)*
**Request**
```json
{ "note": "Status-dot color should reuse getStatusColor() instead of a new switch." }
```
**Response** `200 OK`
```json
{
  "id": "s2", "status": "changes",
  "exerciseId": "e1", "exerciseStatus": "pending",
  "reviewerId": "u_lead", "reviewNote": "Status-dot color should reuse getStatusColor()…",
  "reviewedAt": "2026-06-15T11:52:00Z"
}
```

---

## 8. Search & notifications

### GET `/search?q=auth`
**Response** `200 OK`
```json
{
  "tracks": [
    { "id": "t3", "title": "NestJS Service Layer" }
  ],
  "documents": [
    { "id": "d5", "title": "Service Auth & JWT Flow", "kind": "Guide" }
  ],
  "exercises": [
    { "id": "e4", "title": "Service Auth Middleware", "tag": "NestJS" }
  ]
}
```

### GET `/notifications`
**Response** `200 OK`
```json
{
  "data": [
    { "id": "n1", "type": "submission_reviewed", "title": "Your PR was approved",
      "body": "Add a Paginated Users Endpoint — approved (+200 XP)",
      "read": false, "createdAt": "2026-06-15T11:50:00Z" },
    { "id": "n2", "type": "track_unlocked", "title": "New track unlocked",
      "body": "System Architecture is now available",
      "read": true, "createdAt": "2026-06-14T16:00:00Z" }
  ],
  "unreadCount": 1
}
```

### POST `/notifications/n1/read`
**Response** `200 OK`
```json
{ "id": "n1", "read": true }
```
