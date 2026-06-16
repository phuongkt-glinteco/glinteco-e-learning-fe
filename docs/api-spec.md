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

### `GET /submissions` (Admin Only)
Retrieve the grading queue (Admin Review Queue) containing all pending/submitted student submissions.
- **Query Parameters**:
  - `status`: string (optional, enum: `submitted`, `changes`, `approved`, `rejected`) - Lọc theo trạng thái bài nộp.
  - `cohortId`: UUID (optional) - Lọc theo ID của khóa học.
  - `userId`: UUID (optional) - Lọc theo ID của học viên.
  - `exerciseId`: UUID (optional) - Lọc theo ID của bài tập.
  - `page`: number (optional, default: 1) - Trang cần lấy dữ liệu.
  - `limit`: number (optional, default: 10, max: 100) - Số lượng bài nộp trên mỗi trang.
  - `sortBy`: string (optional, default: `submittedAt`) - Trường sắp xếp kết quả.
  - `sortOrder`: string (optional, enum: `ASC` | `DESC`, default: `ASC`) - Thứ tự sắp xếp.
- **Response**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "userId": "uuid",
        "user": {
          "id": "uuid",
          "name": "Alice Learner",
          "email": "alice@example.com",
          "cohortId": "uuid"
        },
        "exerciseId": "uuid",
        "exercise": {
          "id": "uuid",
          "title": "Build a Todo App",
          "trackId": "uuid"
        },
        "prUrl": "https://github.com/phuongkt-glinteco/glinteco-e-learning-fe/pull/42",
        "status": "submitted",
        "submittedAt": "2026-06-12T10:30:00.000Z",
        "createdAt": "2026-06-12T10:30:00.000Z",
        "updatedAt": "2026-06-12T10:30:00.000Z"
      }
    ],
    "meta": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
  ```

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
