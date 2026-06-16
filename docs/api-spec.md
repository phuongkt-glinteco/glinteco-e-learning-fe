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

## 7. Search & Notifications

### `GET /search`
Global quick search (⌘K) across tracks, documents, and exercises.
- **Query Params**:
  - `q`: String (Required, search query term)
- **Validation Rules**:
  - `q`: IsString(), IsNotEmpty(), MinLength(1)
- **Response**: `200 OK`
  ```json
  {
    "tracks": [
      {
        "id": "uuid",
        "title": "NestJS Service Layer"
      }
    ],
    "documents": [
      {
        "id": "uuid",
        "title": "Service Auth & JWT Flow",
        "kind": "Guide"
      }
    ],
    "exercises": [
      {
        "id": "uuid",
        "title": "Service Auth Middleware",
        "tag": "NestJS"
      }
    ]
  }
  ```

### Data Transfer Objects (DTO) and Validation

#### `SearchQueryDto`
- **q**: `string`
  - `@IsString()`: Must be a string.
  - `@IsNotEmpty()`: Must not be empty.
  - `@MinLength(1)`: Must have at least 1 character.

#### `SearchResponseDto`
- **tracks**: `SearchTrackResultDto[]`
- **documents**: `SearchDocumentResultDto[]`
- **exercises**: `SearchExerciseResultDto[]`

#### `SearchTrackResultDto`
- **id**: `string` (UUID)
- **title**: `string` (Maps to Track `name`)

#### `SearchDocumentResultDto`
- **id**: `string` (UUID)
- **title**: `string`
- **kind**: `string` (`'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link'`)

#### `SearchExerciseResultDto`
- **id**: `string` (UUID)
- **title**: `string`
- **tag**: `string` (Maps to Track `name`)

