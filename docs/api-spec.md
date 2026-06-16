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
- **Query Params**:
  - `q`: Search keyword in title or content (optional).
  - `tags`: Comma-separated list of tag names (e.g., `NestJS,Architecture`) (optional).
  - `kind`: Filter by document kind (Guide, Reference, Runbook, Tutorial, Link) (optional).
  - `limit`: Number of records to return (optional, default 20, max 50).
  - `cursor`: Keyset pagination cursor (optional).
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "React Hooks Cheatsheet",
        "content": "Lesson content or document description...",
        "url": "https://reactjs.org/docs/hooks-intro.html",
        "kind": "Guide",
        "tags": [{ "id": "uuid", "name": "react" }],
        "isBookmarked": true
      }
    ],
    "nextCursor": "eyJpZCI6ImRiNmE2NzYzIn0=",
    "hasMore": false
  }
  ```

### `POST /documents/:id/bookmark`
Bookmark a document for the current authenticated user.
- **Path Params**:
  - `id`: UUID of the document to bookmark.
- **Response**: `200 OK`
  ```json
  {
    "documentId": "uuid",
    "bookmarked": true
  }
  ```

### `DELETE /documents/:id/bookmark`
Remove a bookmarked document for the current authenticated user.
- **Path Params**:
  - `id`: UUID of the document to unbookmark.
- **Response**: `204 No Content`
