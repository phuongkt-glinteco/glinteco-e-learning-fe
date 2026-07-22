# Quickstart: Learner làm Quiz

## Prerequisites

- Run the frontend from `fe/` with the existing environment configuration.
- Use an authenticated learner account.
- Use a Quiz exercise whose detail contains at least one question and choices.

## Manual validation

1. Open `/exercises` and select a Quiz.
2. Confirm loading is visible while detail is loading.
3. Confirm title, description/overview, question, and choices are visible.
4. Select an option and verify no correct answer or grading state is visible yet.
5. Submit the Quiz and confirm the control enters submitting/disabled state.
6. Confirm a successful response shows score and passed/not-passed state.
7. Force or simulate a detail failure, then confirm error state and Retry.
8. Force or simulate a submit failure, then confirm error state and Retry.
9. Open a missing/empty Quiz and confirm empty/not-found handling and no empty submit.

## Contract checks

- Verify `GET /exercises/{id}` returns learner-safe question data without
  `correctAnswer`.
- Verify `POST /exercises/{id}/submit-auto` returns score and passed fields.
- Verify invalid/missing answers return a validation error.
- Verify unauthorized or forbidden access is rejected.

## Automated checks

Run from `fe/`:

```bash
pnpm lint
pnpm build
```

If focused test tooling is present, add/run checks for null question data, unknown
status normalization, successful auto-grade normalization, and error retry behavior.
