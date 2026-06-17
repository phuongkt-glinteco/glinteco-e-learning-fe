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
