# API Design Specification

This document details the RESTful API endpoints for the RAMP UP backend system, including Request/Response payloads and validation rules.

---

## 1. Authentication & Users

### `GET /users/me`
Retrieve the current authenticated user's profile.
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "learner",
    "level": 1,
    "xp": 100,
    "streakDays": 5,
    "cohortId": "uuid"
  }
  ```

---

## 2. Cohorts

### `GET /cohorts`
List cohorts (Admin only).
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Batch 1",
        "targetRampDays": 30
      }
    ],
    "meta": { "total": 1, "page": 1 }
  }
  ```

---

## 3. Tracks & Lessons

### `GET /tracks`
Get all learning tracks.
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Frontend Basics",
        "order": 1,
        "lessonsCount": 10
      }
    ]
  }
  ```

### `GET /tracks/:id/lessons`
Get lessons for a specific track.
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Introduction to React",
        "order": 1,
        "content": "Lesson content here..."
      }
    ]
  }
  ```

---

## 4. Track Progress

### `PATCH /tracks/:id/progress`
Update the progress status of a track for the authenticated user.
- **Request Body**:
  ```json
  {
    "status": "in_progress" // "not_started", "in_progress", "completed"
  }
  ```
- **Validation Rules**:
  - `status`: IsEnum(ProgressStatus), IsNotEmpty()
- **Response**: `200 OK`

---

## 5. Exercises & Submissions

### `GET /tracks/:id/exercises`
Get exercises belonging to a track.
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "Build a Todo App",
        "objectives": { "goal": "Learn state management" },
        "steps": { "1": "Setup Vite", "2": "Create components" }
      }
    ]
  }
  ```

### `POST /exercises/:id/submissions`
Submit a PR link for an exercise.
- **Request Body**:
  ```json
  {
    "prUrl": "https://github.com/user/repo/pull/1"
  }
  ```
- **Validation Rules**:
  - `prUrl`: IsUrl(), IsNotEmpty()
- **Response**: `201 Created`

### `POST /submissions/:id/review` (Admin Only)
Review a submission and log history.
- **Request Body**:
  ```json
  {
    "status": "approved", // "approved", "rejected", "reviewed"
    "comment": "Great job on the component structure!"
  }
  ```
- **Validation Rules**:
  - `status`: IsEnum(SubmissionStatus), IsNotEmpty()
  - `comment`: IsString(), IsOptional()
- **Response**: `201 Created` (Creates `SubmissionHistory` and updates `Submission` status)

---

## 6. Documents & Tags

### `GET /documents`
Search for documents.
- **Query Params**: `?tags=react,hooks&search=state`
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "React Hooks Cheatsheet",
        "url": "https://reactjs.org/docs/hooks-intro.html",
        "tags": [{ "id": "uuid", "name": "react" }]
      }
    ]
  }
  ```

---

## 7. Leaderboard

### `GET /leaderboard`
Retrieve leaderboard rankings for learners.
- **Query Params**:
  - `cohortId`: UUID (Optional) - Filter by a specific cohort.
  - `scope`: `cohort` | `global` (Optional, default: `global`) - Scope of the leaderboard. If `cohort` and `cohortId` is omitted, the API defaults to the authenticated user's cohort.
  - `limit`: Integer (Optional, default: 10, max: 100) - Number of entries to return.
  - `cursor`: Base64 string (Optional) - Cursor for pagination, encoding `(level, xp, streakDays, createdAt, id)`.
- **Validation Rules**:
  - `cohortId`: IsUUID(), IsOptional()
  - `scope`: IsEnum(['cohort', 'global']), IsOptional()
  - `limit`: IsInt(), Min(1), Max(100), IsOptional()
  - `cursor`: IsString(), IsOptional()
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "userId": "uuid",
        "name": "Mina Okonkwo",
        "level": 3,
        "xp": 1240,
        "streakDays": 6,
        "rank": 1
      },
      {
        "userId": "uuid",
        "name": "Raj Patel",
        "level": 2,
        "xp": 720,
        "streakDays": 2,
        "rank": 2
      }
    ],
    "nextCursor": "eyJsaW1pdCI6MTAsImN1cnNvciI6eyJsZXZlbCI6MiwidHAiOjcyMCwic3RyZWFrRGF5cyI6Miwid3JlYXRlZEF0IjoiMjAyNi0wNi0xNlQxMDoxNTowMFoiLCJpZCI6InV1aWQifX0=",
    "hasMore": false
  }
  ```

