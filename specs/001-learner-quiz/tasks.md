---

description: "Implementation tasks for Learner làm Quiz"

---

# Tasks: Learner làm Quiz

**Input**: Design documents from `/specs/001-learner-quiz/`

**Prerequisites**: plan.md and spec.md

**Tests**: T004 and T007 add focused frontend normalizer/component tests; T005 adds
the backend response-safety integration check.

## Phase 1: User Story 1 - Hoàn thành Quiz (Priority: P1) 🎯 MVP

**Goal**: Learner opens a Quiz, selects answers, submits, and sees score and passed
status without seeing correct answers before submit.

**Independent Test**: From My Exercises, open a Quiz, confirm title/description/
questions/choices, select an answer, submit, and verify score plus passed/not-passed.
Also verify loading, empty/not-found, submit error/retry, and disabled/submitting
states.

- [X] T001 [US1] Define learner-owned question/result types and normalize exercise detail in `fe/src/components/features/tracks/learner/types.ts` and `fe/src/components/features/tracks/learner/utils.ts`
- [X] T002 [US1] Remove `correctAnswer` from normalized learner questions and build submit payload from learner answers only in `fe/src/components/features/tracks/learner/utils.ts` and `fe/src/components/features/tracks/learner/courseLearningApi.ts`
- [X] T003 [US1] Normalize `AutoGradeResultDto` into `LearnerAutoGradeResult` before passing the result to `ExerciseDetailView` in `fe/src/components/features/tracks/learner/utils.ts`, `fe/src/components/features/tracks/learner/courseLearningApi.ts`, and `fe/src/components/features/tracks/learner/ExerciseDetailView.tsx`
- [X] T004 [US1] Add focused tests for `correctAnswer` omission and `score`/`passed`/`correctCount`/per-question result mapping in `fe/src/components/features/tracks/learner/utils.test.ts`
- [X] T005 [US1] Enforce learner response safety so `correctAnswer` and pre-submit `explanation` are omitted from `GET /exercises/{id}`, while auto-grade results may return post-submit explanation in `be/src/exercises/exercises.service.ts`, `be/src/exercises/dto/exercise-response.dto.ts`, and `be/src/exercises/exercises.service.spec.ts`
- [X] T006 [US1] Render per-question `explanation` from the normalized auto-grade result only after successful submission in `fe/src/components/features/tracks/learner/QuizExercisePanel.tsx`
- [X] T007 [US1] Add focused tests for post-submit explanation rendering and absence of explanation/correct answer before submit in `fe/src/components/features/tracks/learner/QuizExercisePanel.test.tsx`

**Checkpoint**: User Story 1 is independently functional and manually verifiable.

## Dependencies & Execution Order

### Phase Dependencies

- T001 precedes T002 and T003.
- T002 and T003 precede T004 and T006.
- T005 precedes T006 and T007.
- T006 precedes T007.

### User Story Dependencies

- User Story 1 is the only story and is independently testable after T007.

### Parallel Opportunities

- T002, T003, and T005 can be developed in parallel after T001 if they touch
  separate boundaries; T004 and T006 follow the relevant normalization/contract
  work; T007 follows T005 and T006.

## Implementation Strategy

### MVP First

1. Complete T001.
2. Complete T002-T006.
3. Run T004 and T007, then validate the core open → answer → submit → result flow.

### Scope Guardrails

- Do not add a `/start` endpoint or fake persisted progress state.
- Do not modify generated files under `fe/src/services/client/`.
- Do not change PR_REVIEW or FILL_IN_BLANK behavior; explanation rendering is scoped to Quiz.
- Do not expand the feature beyond learner role.
- Backend must omit `correctAnswer` from learner responses; FE normalization is an
  additional safeguard.
- Backend must not expose `explanation` before submit; learner-facing explanation
  is returned and rendered only as part of the successful auto-grade result.

## Phase 2: Convergence

- [X] T008 [US1] Render every normalized Quiz question, require a non-empty learner answer for each before submission, and show an explicit unavailable state for empty question data in `fe/src/components/features/tracks/learner/QuizExercisePanel.tsx` and `fe/src/components/features/tracks/learner/ExerciseDetailContainer.tsx` per FR-002, FR-003, FR-005, and the empty-Quiz edge case (partial)
- [X] T009 [US1] Add focused regression coverage for multi-question rendering and incomplete/empty Quiz submission in `fe/src/components/features/tracks/learner/QuizExercisePanel.test.tsx` and `fe/src/components/features/tracks/learner/utils.test.ts` per FR-002, FR-003, FR-005, and Constitution VI (partial)

## Phase 3: Convergence

- [X] T010 [US1] Restore the learner auto-submit and detail type boundary by importing `buildAutoAnswerPayload` in `fe/src/components/features/tracks/learner/courseLearningApi.ts` and carrying `isReadOnly` through the normalized `LearnerExerciseDetail` shape, with focused regression coverage, per FR-005, FR-009, and the plan normalization boundary (missing)
- [X] T011 [US1] Make the focused Quiz test fixtures type-safe in `fe/src/components/features/tracks/learner/QuizExercisePanel.test.tsx` and `fe/src/components/features/tracks/learner/utils.test.ts`, preserving their no-leakage and empty-data assertions so `tsc --noEmit` can validate the feature tests per Constitution VI (partial)
- [X] T012 [US1] Regenerate the read-only OpenAPI client from the current backend contract and verify the frontend typecheck, resolving the stale `ExerciseQuestionResponseDto` export without hand-editing `fe/src/services/client/`, per the plan API constraint and Constitution II (partial)
