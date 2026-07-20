# Quiz API Contract

## Access

- Actor: authenticated `learner`.
- The learner may read an exercise they are allowed to access.
- The learner may submit answers for that exercise.
- Guest, mentor, and admin flows are out of scope.

## Read Quiz detail

`GET /exercises/{id}`

### Success

The response must expose the learner-safe fields required to render the Quiz:
`id`, `title`, `brief`, `overview`, `type`, `questionsData`, and `targetScore`.
`questionsData` contains question IDs, prompts, and choices. It MUST NOT expose
`correctAnswer` to the learner.

### Errors

- `401/403`: show the existing access/error state according to the shared error flow.
- `404`: show not-found state.
- Other failures: show error state with retry.

## Submit Quiz

`POST /exercises/{id}/submit-auto`

### Request

```json
{
  "answers": [
    { "questionId": "question-id", "answer": "selected-option" }
  ]
}
```

The request must contain non-empty answers for the Quiz's required questions. The
submit control is disabled while the request is in flight.

### Success

The response must contain `score`, `correctCount`, `totalQuestions`, `targetScore`,
`passed`, `completed`, and per-question results. The FE normalizes the response before
rendering it.

### Errors

- `400`: show validation/submission error and allow retry after correction.
- `401/403`: show the shared access/error state.
- `404`: show not-found state if the exercise no longer exists.
- Other failures: show error state and retry action.

## Explicitly out of scope

- `POST /exercises/{id}/submissions` and `PUT /exercises/{id}/submissions` are for
  PR_REVIEW, not Quiz.
- No `/start`, assignment, progress, or Quiz history contract is assumed.
- Generated client files under `fe/src/services/client/` are read-only.
