# Data Model: Learner làm Quiz

## LearnerQuiz

Normalized data used by the learner detail flow.

| Field | Type | Rule |
|---|---|---|
| `id` | string | Required; identifies the exercise. |
| `title` | string | Required for the detail heading. |
| `brief` | string | Short learner-facing description. |
| `overview` | string | Optional detailed instructions; empty is valid. |
| `type` | `QUIZ` | This feature only handles Quiz. |
| `questions` | QuizQuestion[] | Must contain renderable questions; empty triggers empty/not-found handling. |
| `targetScore` | number | Used for display/interpretation of the returned result; supplied by contract. |

## QuizQuestion

| Field | Type | Rule |
|---|---|---|
| `id` | string | Required for answer submission. |
| `prompt` | string | Required for the question display. |
| `options` | string[] | Renderable answer choices; empty options are invalid for a selectable Quiz. |
| `answer` | string | Learner-local selection; never includes the correct answer. |

## QuizSubmission

| Field | Type | Rule |
|---|---|---|
| `exerciseId` | string | Matches the opened Quiz. |
| `answers` | `{ questionId: string; answer: string }[]` | One answer per submitted question; no empty values. |

## QuizResult

| Field | Type | Rule |
|---|---|---|
| `score` | number | Returned by auto-grade. |
| `correctCount` | number | Returned by auto-grade. |
| `totalQuestions` | number | Returned by auto-grade. |
| `targetScore` | number | Returned by auto-grade. |
| `passed` | boolean | Determines passed/not-passed UI. |
| `completed` | boolean | Backend completion state; display only if supported by existing UI. |
| `results` | question result[] | Must not be used to reveal grading before submit. |

## State transitions

```text
loading → success(detail) → answering → submitting → success(result)
    │           │                │             │
    └──────→ error/retry         └────────────→ error/retry

missing/invalid detail → empty or not-found
```

Correct-answer and per-question grading data are unavailable to the learner before
the `success(result)` state.
