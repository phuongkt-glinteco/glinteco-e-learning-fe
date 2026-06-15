# Glinteco e-Learning

> **Glinteco e-Learning** is an internal engineering onboarding portal (in-app brand: **RAMP UP**).
> Project documentation & proposed API surface, reverse-engineered from the
> interactive design prototype in [`app-design/`](../app-design/).
>
> See [`API_EXAMPLES.md`](./API_EXAMPLES.md) for example request/response payloads per endpoint.

---

## 1. Overview

**RAMP UP** is an internal **engineering onboarding portal**. New engineers ("learners")
progress through a structured curriculum of **learning tracks**, read curated **documentation**,
and complete practical **exercises** by submitting GitHub PR links. **Admins** (engineering
managers / leads) author the curriculum, manage the documentation library, and review submissions.

The design is gamified: learners earn **XP**, maintain a **day streak**, advance **levels**,
and unlock tracks sequentially. The whole product is a single-page app with a pixel-art / CRT
aesthetic and light + dark themes.

| | |
|---|---|
| **Project name** | Glinteco e-Learning (in-app brand: RAMP UP) |
| **Type** | Internal onboarding / e-learning web app |
| **Roles** | `learner`, `admin` |
| **Frontend (implied)** | Next.js (App Router), Tailwind, shared component library |
| **Backend (implied)** | NestJS service layer, JWT auth, event bus |
| **API style** | REST, cursor (keyset) pagination, DTO validation |

> The track curriculum itself documents the assumed stack: *Local Dev (pnpm + Docker Compose) →
> Frontend (Next.js) → NestJS Service Layer → System Architecture (event-driven) → Testing & CI
> (Playwright)*. The proposed API below follows those same conventions.

---

## 2. Roles & permissions

| Capability | Learner | Admin |
|---|:---:|:---:|
| View own dashboard / progress | ✅ | — |
| View cohort dashboard & analytics | — | ✅ |
| Browse tracks, docs, exercises | ✅ | ✅ |
| Submit / re-submit exercise PR | ✅ | — |
| Review submissions (approve / request changes) | — | ✅ |
| Create / edit tracks (milestones) | — | ✅ |
| Add documents, create tags | — | ✅ |
| Create exercises | — | ✅ |

The prototype exposes a **role toggle** in the header (`learner` ⇄ `admin`) for preview only;
in production the role comes from the authenticated user.

---

## 3. Screens & features

### 3.1 Auth (`Login.jsx`)
- Sign in / Create account toggle (email + password, full name on signup).
- "Remember me", "Forgot password".
- **Continue with Google** (OAuth).
- Branded splash → on success enters the portal shell.

### 3.2 App shell (`Shell.jsx`)
- Collapsible sidebar nav: **Dashboard, Learning Tracks, Documentation, Exercises**.
- Header: quick search (⌘K), role toggle (preview), CRT toggle, theme toggle, notification bell, profile menu, sign out.
- Shared state: current exercises + submissions, theme, role.

### 3.3 Dashboard (`Dashboard.jsx`)
**Learner**
- Overall completion meter, tracks completed count, level + XP.
- Stat cards: XP earned (+ weekly delta), day streak, exercises (n/total + awaiting review), saved docs (+ unread).
- "Continue Learning" card → current in-progress track with lesson progress.
- Recent documents grid.

**Admin**
- Cohort header (e.g. *Spring 2026 · 14 engineers*), Export, Review Queue shortcut.
- Stat cards: active learners, avg completion, pending review, avg ramp time vs target.
- Live **Recent Submissions** feed.
- Per-track **cohort completion** bars.

### 3.4 Learning Tracks (`Tracks.jsx`)
- Vertical stepper timeline: START → milestones → "Production Ready" finish node.
- Each track: title, description, est. time, lesson count, status (`completed` / `in_progress` / `locked`), per-lesson progress for the active track.
- Learner actions: Continue / Review / (Locked).
- Admin actions: **Add milestone** (anywhere in sequence), **Edit milestone**, Preview.

### 3.5 Documentation (`Docs.jsx`)
- Searchable resource library; grid/list view toggle.
- Each doc: title, URL, `kind` (Guide / Reference / Runbook / Tutorial / Link), tags, "updated" timestamp.
- **Tag filtering** (multi-select chips) + free-text search.
- Admin: **Add document**, **create new tags** (auto-assigned color, instantly filterable).

### 3.6 Exercises (`Exercises.jsx`)
- Practical tasks tied to a track + tag, with `difficulty` (Beginner/Intermediate/Advanced), est. time, XP reward.
- Detail modal: overview, **acceptance criteria** (objectives), step-by-step approach, helpful resources (linked docs), a hint.
- Status flow: `pending` → `submitted` → `approved` (or `changes` requested).
- **Learner** submits a GitHub PR / branch link; can re-submit.
- **Admin** review queue: approve or request changes; reviewed tab; create new exercise.

---

## 4. Domain model

Entities and key fields inferred from the mock data (`app-design/data.jsx`).

### User
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `name` | string | |
| `handle` | string | `@mina` |
| `email` | string | unique |
| `role` | enum | `learner` \| `admin` |
| `title` | string | e.g. "Frontend Engineer" |
| `avatarHue` | int | 0–360, generated avatar color |
| `level` | int | gamification |
| `xp` | int | total XP |
| `streakDays` | int | current day streak |
| `cohortId` | uuid | FK → Cohort |
| `joinedAt` | datetime | |

### Cohort
`id`, `name` (e.g. "Spring 2026"), `learnerCount`, `avgCompletion`, `avgRampDays`, `targetRampDays`, `createdAt`.

### Track (milestone)
| Field | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `title` | string | |
| `description` | string | |
| `icon` | string | icon key |
| `estimatedTime` | string | "2.5h" |
| `order` | int | sequence position |
| `lessonCount` | int | |
| `status`* | enum | `completed` \| `in_progress` \| `locked` (per-learner, derived) |

\* Status is **per-learner progress**, not a property of the track itself — see `TrackProgress`.

### Lesson
`id`, `trackId`, `title`, `order`, `content/body`, `estimatedTime`.

### TrackProgress (per learner × track)
`userId`, `trackId`, `status`, `lessonsCompleted`, `completedAt`.

### Document
`id`, `title`, `url`, `kind` (`Guide`/`Reference`/`Runbook`/`Tutorial`/`Link`), `tags[]`, `updatedAt`. Plus per-user: bookmarked / read state.

### Tag
`id`, `name`, `color` (`accent`/`info`/`warn`/`danger`/`muted`).

### Exercise
| Field | Type |
|---|---|
| `id`, `title`, `brief`, `overview`, `hint` | string |
| `trackId` | uuid |
| `tag`, `difficulty` | enum |
| `estimatedTime` | string |
| `xp` | int |
| `objectives[]` (acceptance criteria) | string[] |
| `steps[]` | string[] |
| `resourceDocIds[]` | uuid[] |

### Submission
`id`, `exerciseId`, `userId`, `prUrl`, `status` (`submitted`/`approved`/`changes`), `reviewerId`, `reviewNote`, `submittedAt`, `reviewedAt`.

---

## 5. Proposed API endpoints

Base path: **`/api/v1`**. All authenticated routes expect `Authorization: Bearer <jwt>`.
List endpoints use **cursor pagination** (`?cursor=&limit=` → `{ data, nextCursor, hasMore }`),
the project's documented standard (see exercise *e2*).

### 5.1 Auth & session
| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/auth/register` | public | Create account (name, email, password). |
| `POST` | `/auth/login` | public | Email + password → access + refresh tokens. |
| `POST` | `/auth/google` | public | Google OAuth sign-in / sign-up. |
| `POST` | `/auth/refresh` | public | Exchange refresh token for new access token. |
| `POST` | `/auth/logout` | auth | Invalidate refresh token. |
| `POST` | `/auth/forgot-password` | public | Send reset email. |
| `POST` | `/auth/reset-password` | public | Reset password with token. |
| `GET`  | `/auth/me` | auth | Current user + role + profile. |

### 5.2 Users & profile
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/users` | admin | List users (cursor paginated, `?cohortId=&role=&q=`). |
| `GET` | `/users/:id` | auth* | User profile. |
| `PATCH` | `/users/me` | auth | Update own profile. |
| `GET` | `/users/me/stats` | learner | XP, level, streak, completion %, counts (dashboard). |

\* learners may only fetch themselves.

### 5.3 Cohorts (admin analytics)
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/cohorts` | admin | List cohorts. |
| `GET` | `/cohorts/:id` | admin | Cohort detail. |
| `GET` | `/cohorts/:id/overview` | admin | Dashboard stats: active learners, avg completion, pending review, avg ramp time. |
| `GET` | `/cohorts/:id/track-completion` | admin | Per-track completion % across cohort. |
| `GET` | `/cohorts/:id/export` | admin | Export progress report (CSV). |

### 5.4 Tracks & lessons
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/tracks` | auth | List tracks ordered, with caller's per-track status/progress. |
| `GET` | `/tracks/:id` | auth | Track detail + lessons. |
| `POST` | `/tracks` | admin | Create milestone (`order` to position). |
| `PATCH` | `/tracks/:id` | admin | Edit milestone. |
| `DELETE` | `/tracks/:id` | admin | Remove milestone. |
| `PATCH` | `/tracks/reorder` | admin | Bulk reorder milestones. |
| `GET` | `/tracks/:id/lessons` | auth | Lessons in a track. |
| `POST` | `/tracks/:id/lessons` | admin | Add lesson. |
| `PATCH` | `/lessons/:id` | admin | Edit lesson. |
| `DELETE` | `/lessons/:id` | admin | Delete lesson. |
| `POST` | `/lessons/:id/complete` | learner | Mark lesson complete (advances progress, awards XP, may unlock next track). |

### 5.5 Documents & tags
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/documents` | auth | List/search docs. `?q=&tags=Frontend,NestJS&kind=&view=`. Cursor paginated. |
| `GET` | `/documents/recent` | learner | Recently viewed docs (dashboard). |
| `GET` | `/documents/:id` | auth | Doc detail. |
| `POST` | `/documents` | admin | Add document. |
| `PATCH` | `/documents/:id` | admin | Edit document. |
| `DELETE` | `/documents/:id` | admin | Delete document. |
| `POST` | `/documents/:id/bookmark` | learner | Save / bookmark doc. |
| `DELETE` | `/documents/:id/bookmark` | learner | Remove bookmark. |
| `GET` | `/tags` | auth | List tags (with colors). |
| `POST` | `/tags` | admin | Create tag (auto-assigns color). |
| `DELETE` | `/tags/:id` | admin | Delete tag. |

### 5.6 Exercises
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/exercises` | auth | List exercises with caller's status (`?trackId=&tag=&difficulty=&status=`). |
| `GET` | `/exercises/:id` | auth | Full detail: overview, objectives, steps, resources, hint. |
| `POST` | `/exercises` | admin | Create exercise. |
| `PATCH` | `/exercises/:id` | admin | Edit exercise. |
| `DELETE` | `/exercises/:id` | admin | Delete exercise. |

### 5.7 Submissions & review
| Method | Path | Role | Description |
|---|---|---|---|
| `POST` | `/exercises/:id/submissions` | learner | Submit PR/branch link → status `submitted`. |
| `PUT` | `/exercises/:id/submissions` | learner | Re-submit (update PR link). |
| `GET` | `/submissions` | admin | Review feed (`?status=submitted&cohortId=`), cursor paginated. |
| `GET` | `/submissions/mine` | learner | Caller's own submissions. |
| `GET` | `/submissions/:id` | auth* | Submission detail. |
| `POST` | `/submissions/:id/approve` | admin | Approve → exercise `approved`, awards XP. |
| `POST` | `/submissions/:id/request-changes` | admin | Request changes (+ optional `note`) → status `changes`. |

\* owner or admin.

### 5.8 Search & notifications
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/search` | auth | Global quick search (⌘K) across tracks, docs, exercises. `?q=`. |
| `GET` | `/notifications` | auth | List notifications (bell). |
| `POST` | `/notifications/:id/read` | auth | Mark read. |

---

## 6. Conventions

- **Pagination** — keyset/cursor, ordered by `(createdAt, id)`; response `{ data[], nextCursor, hasMore }`; `limit` max 50.
- **Validation** — DTOs via `class-validator`; invalid params → `400`.
- **Errors** — consistent shape `{ statusCode, message, error }`.
- **Auth** — JWT access (short-lived) + refresh token; role guard on admin routes.
- **Status codes** — `200` ok, `201` created, `400` validation, `401` unauthenticated, `403` wrong role, `404` not found, `409` conflict.
- **XP / unlock side effects** — completing lessons and approved submissions award XP and may unlock the next track; surface updated totals in the response.

---

## 7. Suggested build order

1. Auth (register/login/Google/JWT/me) + role guards.
2. Users + `/users/me/stats` (powers learner dashboard).
3. Tracks + lessons + per-learner progress + unlock logic.
4. Documents + tags + search/filter.
5. Exercises + submissions + admin review.
6. Cohort analytics + notifications + global search.
