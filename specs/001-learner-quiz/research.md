# Research: Learner làm Quiz

## Decision: Reuse the existing learner exercise detail flow

**Rationale**: The repository already has the authenticated exercise routes,
`ExerciseDetailContainer`, `ExerciseDetailView`, `QuizExercisePanel`, internal learner
types, and `courseLearningApi`. Reusing them minimizes scope and preserves existing
PR_REVIEW/FILL_IN_BLANK behavior.

**Alternatives considered**: A separate Quiz route or parallel container was rejected
because it would duplicate loading, breadcrumb, error, and submission orchestration.

## Decision: Use the auto-grade endpoint for Quiz submission

**Rationale**: `POST /exercises/{id}/submit-auto` accepts answer pairs and returns
`score`, `correctCount`, `totalQuestions`, `targetScore`, `passed`, `completed`, and
per-question grading results. This directly supports the acceptance criteria.

**Alternatives considered**: PR submission endpoints are only for PR_REVIEW and do not
represent Quiz grading. A client-side score calculation was rejected because it would
expose or duplicate grading rules.

## Decision: No Start Exercise state in this feature

**Rationale**: No `/start`, assignment, or progress endpoint is part of the confirmed
API surface. The feature therefore starts when the learner opens the Quiz detail and
does not invent persistence for an uncontracted state.

**Alternatives considered**: Faking `in_progress` locally was rejected because it would
create misleading state and conflict with the contract-first principle.

## Decision: Normalize at the service boundary

**Rationale**: Generated DTOs are transport shapes. The existing `utils.ts` boundary
already normalizes exercise detail and statuses into `LearnerExerciseDetail` and
learner-owned status values.

**Alternatives considered**: Passing `ExerciseDetailDto` or `AutoGradeResultDto`
directly into presentational components was rejected by the project constitution.

## Resolved risks

- `type`, `questionsData`, and `targetScore` exist in the generated local snapshot,
  but live exposure must be verified before implementation.
- Learner payloads must omit `correctAnswer`; the FE will not synthesize it.
- Unknown API statuses remain adapter concerns and must not leak to views.
