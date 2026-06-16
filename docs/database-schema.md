# Database Schema Documentation

This document provides a detailed overview of the TypeORM entities designed for the RAMP UP system.

## Entities

### 1. User (`users` table)
- **id**: UUID (Primary Key)
- **email**: VARCHAR (Unique)
- **name**: VARCHAR
- **role**: ENUM (`learner`, `admin`) - Default: `learner`
- **level**: INT - Default: 1
- **xp**: INT - Default: 0
- **streakDays**: INT - Default: 0
- **cohortId**: UUID (Foreign Key to `cohorts.id`, Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `Cohort` (A user belongs to a cohort).
- **One-to-Many** with `TrackProgress` (A user has many track progresses).
- **One-to-Many** with `Submission` (A user has many exercise submissions).
- **Many-to-Many** with `Document` (Bookmarked documents, using junction table `user_bookmarks`).

---

### 2. Cohort (`cohorts` table)
- **id**: UUID (Primary Key)
- **name**: VARCHAR
- **targetRampDays**: INT
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **One-to-Many** with `User` (A cohort has many users).

---

### 3. Track (`tracks` table)
- **id**: UUID (Primary Key)
- **name**: VARCHAR
- **order**: INT
- **lessonsCount**: INT - Default: 0
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **One-to-Many** with `Lesson` (A track contains many lessons).
- **One-to-Many** with `TrackProgress` (A track has many progress records).
- **One-to-Many** with `Exercise` (A track has many exercises).

---

### 4. Lesson (`lessons` table)
- **id**: UUID (Primary Key)
- **trackId**: UUID (Foreign Key to `tracks.id`)
- **name**: VARCHAR
- **order**: INT
- **content**: TEXT
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `Track` (A lesson belongs to a track).

---

### 5. TrackProgress (`track_progresses` table)
- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key to `users.id`)
- **trackId**: UUID (Foreign Key to `tracks.id`)
- **status**: ENUM (`not_started`, `in_progress`, `completed`) - Default: `not_started`
- **startedAt**: TIMESTAMP (Nullable)
- **completedAt**: TIMESTAMP (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `User`
- **Many-to-One** with `Track`

---

### 6. Exercise (`exercises` table)
- **id**: UUID (Primary Key)
- **trackId**: UUID (Foreign Key to `tracks.id`)
- **title**: VARCHAR
- **objectives**: JSONB (Nullable)
- **steps**: JSONB (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `Track`
- **One-to-Many** with `Submission`

---

### 7. Submission (`submissions` table)
- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key to `users.id`)
- **exerciseId**: UUID (Foreign Key to `exercises.id`)
- **prUrl**: VARCHAR
- **status**: ENUM (`pending`, `reviewed`, `approved`, `rejected`) - Default: `pending`
- **submittedAt**: TIMESTAMP (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `User`
- **Many-to-One** with `Exercise`
- **One-to-Many** with `SubmissionHistory`

---

### 8. SubmissionHistory (`submission_histories` table)
- **id**: UUID (Primary Key)
- **submissionId**: UUID (Foreign Key to `submissions.id`)
- **adminId**: UUID (Foreign Key to `users.id`)
- **action**: VARCHAR (e.g., `approve`, `request_changes`)
- **comment**: TEXT (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `Submission`
- **Many-to-One** with `User` (Admin)

---

### 9. Document (`documents` table)
- **id**: UUID (Primary Key)
- **title**: VARCHAR
- **content**: TEXT (Nullable)
- **url**: VARCHAR (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-Many** with `Tag` (Using junction table `document_tags`).
- **Many-to-Many** with `User` (Bookmarked by, using junction table `user_bookmarks`).

---

### 10. Tag (`tags` table)
- **id**: UUID (Primary Key)
- **name**: VARCHAR (Unique)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-Many** with `Document` (Using junction table `document_tags`).

---

### 11. UserBookmark (`user_bookmarks` junction table)
- **userId**: UUID (Foreign Key to `users.id`, Primary Key, ON DELETE CASCADE)
- **documentId**: UUID (Foreign Key to `documents.id`, Primary Key, ON DELETE CASCADE)

**Relationships:**
- Junction table linking `User` and `Document` for the bookmarking feature.
