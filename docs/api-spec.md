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

### `POST /cohorts` (Admin only)
Create a new cohort.
- **Request Body**:
  ```json
  {
    "name": "Summer 2026",
    "targetRampDays": 14
  }
  ```
- **Validation Rules**:
  - `name`: IsString(), IsNotEmpty()
  - `targetRampDays`: IsInt(), IsPositive(), IsNotEmpty()
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "Summer 2026",
    "targetRampDays": 14,
    "isActive": true,
    "createdAt": "2026-06-16T22:00:00.000Z",
    "updatedAt": "2026-06-16T22:00:00.000Z"
  }
  ```

### `GET /cohorts` (Admin only)
List cohorts with pagination.
- **Query Params**: `?page=1&limit=20`
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Summer 2026",
        "targetRampDays": 14,
        "isActive": true,
        "createdAt": "2026-06-16T22:00:00.000Z",
        "updatedAt": "2026-06-16T22:00:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "lastPage": 1
    }
  }
  ```

### `GET /cohorts/:id` (Admin only)
Get details of a cohort.
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "Summer 2026",
    "targetRampDays": 14,
    "isActive": true,
    "createdAt": "2026-06-16T22:00:00.000Z",
    "updatedAt": "2026-06-16T22:00:00.000Z"
  }
  ```

### `PATCH /cohorts/:id` (Admin only)
Update details of a cohort.
- **Request Body**:
  ```json
  {
    "name": "Summer 2026 - Revised",
    "targetRampDays": 15,
    "isActive": false
  }
  ```
- **Validation Rules**:
  - `name`: IsString(), IsOptional()
  - `targetRampDays`: IsInt(), IsPositive(), IsOptional()
  - `isActive`: IsBoolean(), IsOptional()
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "Summer 2026 - Revised",
    "targetRampDays": 15,
    "isActive": false,
    "createdAt": "2026-06-16T22:00:00.000Z",
    "updatedAt": "2026-06-16T22:05:00.000Z"
  }
  ```

### `DELETE /cohorts/:id` (Admin only)
Delete a cohort. Will reject if there are users associated with the cohort.
- **Response**: `200 OK` or `400 Bad Request` (if contains users)

---

## 3. Tracks & Lessons

### `GET /tracks`
Get all learning tracks with current learner's progress.
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Frontend Basics",
        "order": 1,
        "lessonsCount": 10,
        "progress": {
          "lessonsCompleted": 4,
          "status": "in_progress" // "locked", "in_progress", "completed"
        }
      }
    ]
  }
  ```

### `POST /tracks` (Admin Only)
Create a new learning track.
- **Request Body**:
  ```json
  {
    "name": "Backend Basics",
    "order": 2
  }
  ```
- **Validation Rules**:
  - `name`: IsString(), IsNotEmpty(), MaxLength(100)
  - `order`: IsInt(), IsMin(1), IsNotEmpty()
- **Response**: `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "Backend Basics",
    "order": 2,
    "lessonsCount": 0,
    "createdAt": "2026-06-16T15:12:34.000Z",
    "updatedAt": "2026-06-16T15:12:34.000Z"
  }
  ```

### `GET /tracks/:id`
Get a specific learning track details.
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "Frontend Basics",
    "order": 1,
    "lessonsCount": 10,
    "progress": {
      "lessonsCompleted": 4,
      "status": "in_progress"
    }
  }
  ```

### `PATCH /tracks/:id` (Admin Only)
Update an existing learning track.
- **Request Body**:
  ```json
  {
    "name": "Advanced Frontend",
    "order": 1
  }
  ```
- **Validation Rules**:
  - `name`: IsString(), IsOptional(), MaxLength(100)
  - `order`: IsInt(), IsMin(1), IsOptional()
- **Response**: `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "Advanced Frontend",
    "order": 1,
    "lessonsCount": 10,
    "createdAt": "2026-06-16T15:12:34.000Z",
    "updatedAt": "2026-06-16T15:12:35.000Z"
  }
  ```

### `DELETE /tracks/:id` (Admin Only)
Delete a learning track.
- **Response**: `204 No Content`

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
