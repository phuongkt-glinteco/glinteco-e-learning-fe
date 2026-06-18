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

**Indexes:**
- **IDX_users_leaderboard_global**: Composite index on (`level DESC`, `xp DESC`, `streakDays DESC`, `createdAt ASC`, `id ASC`) for optimal global leaderboard performance and stable cursor pagination.
- **IDX_users_leaderboard_cohort**: Composite index on (`cohortId`, `level DESC`, `xp DESC`, `streakDays DESC`, `createdAt ASC`, `id ASC`) for optimal cohort-wide leaderboard performance.

---

### 2. Cohort (`cohorts` table)
- **id**: UUID (Primary Key)
- **name**: VARCHAR
- **targetRampDays**: INT
- **isActive**: BOOLEAN - Default: `true`
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

> [!NOTE]
> Lesson-level metadata shown on the UI (duration/read time, difficulty, XP) is dynamically retrieved from the parent Track's associated `Exercise` details to avoid database redundancy.

**Relationships:**
- **Many-to-One** with `Track` (A lesson belongs to a track).

---

### 5. TrackProgress (`track_progresses` table)
- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key to `users.id`)
- **trackId**: UUID (Foreign Key to `tracks.id`)
- **status**: ENUM (`not_started`, `in_progress`, `completed`) - Default: `not_started`
- **lessonsCompleted**: INT - Default: 0
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
- **tag**: VARCHAR
- **difficulty**: ENUM (`Beginner`, `Intermediate`, `Advanced`) - Default: `Intermediate`
- **estimatedTime**: VARCHAR - Default: `1h`
- **xp**: INT - Default: 0
- **brief**: TEXT
- **overview**: TEXT
- **hint**: TEXT (Nullable)
- **objectives**: JSONB (Nullable)
- **steps**: JSONB (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `Track`
- **One-to-Many** with `Submission`
- **Many-to-Many** with `Document` (Using junction table `exercise_documents`)

---

### 7. Submission (`submissions` table)
- **id**: UUID (Primary Key)
- **userId**: UUID (Foreign Key to `users.id`)
- **exerciseId**: UUID (Foreign Key to `exercises.id`)
- **prUrl**: VARCHAR
- **status**: ENUM (`pending`, `submitted`, `changes`, `approved`, `rejected`) - Default: `pending`
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
- **adminId**: UUID (Foreign Key to `users.id`, Nullable)
- **prUrl**: VARCHAR (Nullable)
- **action**: VARCHAR (e.g., `submitted`, `resubmitted`, `approve`, `request_changes`)
- **comment**: TEXT (Nullable)
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-One** with `Submission`
- **Many-to-One** with `User` (Admin, Nullable)

### 9. Document (`documents` table)
- **id**: UUID (Primary Key)
- **title**: VARCHAR
- **content**: TEXT (Nullable)
- **url**: VARCHAR (Nullable)
- **kind**: ENUM (`Guide`, `Reference`, `Runbook`, `Tutorial`, `Link`) - Default: `Guide`
- **createdAt**: TIMESTAMP
- **updatedAt**: TIMESTAMP

**Relationships:**
- **Many-to-Many** with `Tag` (Using junction table `document_tags`).
- **Many-to-Many** with `User` (Bookmarked by, using junction table `user_bookmarks`).

---

## Database Optimizations for Global Search (⌘K)

To support efficient full-text searching (FTS) across tracks, documents, and exercises, GIN (Generalized Inverted Index) indexes are created:
1. **Tracks**: GIN index using `to_tsvector('simple', "name")`
2. **Documents**: GIN index using `to_tsvector('simple', "title" || ' ' || coalesce("content", ''))`
3. **Exercises**: GIN index using `to_tsvector('simple', "title")`

The `simple` dictionary parser is used to correctly handle Vietnamese, English, and technical jargon keywords without stemming, ensuring high-accuracy keyword searching.

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
