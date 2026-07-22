# Implementation Plan: Learner làm Quiz

**Branch**: `001-learner-quiz` | **Date**: 2026-07-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-learner-quiz/spec.md`

## Summary

Hoàn thiện và chuẩn hóa flow Quiz cho learner trên route `/exercises/[exerciseId]`:
đọc exercise detail, hiển thị câu hỏi/lựa chọn qua learner-owned types, submit đáp án
qua endpoint auto-grade, rồi hiển thị score và passed. Tận dụng các component, service
wrapper và normalizer hiện có; không thêm flow Start Exercise vì backend chưa có
contract tương ứng.

## Technical Context

**Language/Version**: TypeScript, Next.js 15 App Router, React 19

**Primary Dependencies**: Existing generated OpenAPI client, existing learner feature
components, existing error and translation utilities

**Storage**: N/A; quiz answers remain local until submit, result is returned by API

**Testing**: Focused FE normalizer/component tests where test harness exists, plus
manual quickstart verification; backend endpoint integration tests are required for
the API/state contract owner

**Target Platform**: Authenticated web app for learner role

**Project Type**: Next.js frontend integrated with NestJS API

**Performance Goals**: Detail and result states render without avoidable duplicate
requests; submit shows immediate disabled/submitting feedback

**Constraints**: API detail must expose `type`, `questionsData`, and `targetScore`
for the learner contract. Correct answers MUST NOT be exposed before submit. Do not
hand-edit `fe/src/services/client/` generated files. Do not introduce `/start`,
assignment, or progress behavior without a backend contract.

**Scale/Scope**: One learner exercise detail flow, covering QUIZ only; existing
PR_REVIEW and FILL_IN_BLANK behavior remains unchanged.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] User outcome and acceptance scenarios are defined in `spec.md`.
- [x] Role scope is learner only; no guest, mentor, or admin expansion.
- [x] Request, response, error, and permission behavior is documented in
  `contracts/quiz-api.md`.
- [x] Generated API DTOs are normalized before reaching `QuizExercisePanel` or
  `ExerciseDetailView`.
- [x] Loading, error/retry, empty/not-found, success, and disabled/submitting states
  are covered in the spec and quickstart.
- [x] Existing route/container/view/types/normalizer/service patterns are reused;
  focused verification is documented.

**Normalization boundary**: Transport DTOs are used only at the service/container
boundary. `normalizeExerciseDetail` MUST remove `correctAnswer` from learner
questions, and `normalizeAutoGradeResult` MUST map `AutoGradeResultDto` to
`LearnerAutoGradeResult`. `ExerciseDetailView` and `QuizExercisePanel` MUST receive
learner-owned types only. The backend MUST also omit `correctAnswer` from learner
responses; frontend stripping is defense-in-depth, not a replacement for backend
data minimization.

## Phase 0: Research Decisions

See [research.md](./research.md). Key decisions:

- Use `GET /exercises/{id}` for detail and `POST /exercises/{id}/submit-auto` for
  QUIZ submission.
- Keep `POST /exercises/{id}/submissions` and `PUT /exercises/{id}/submissions`
  outside this feature's Quiz flow; they remain PR_REVIEW behavior.
- Treat absent or malformed learner question data as an explicit empty/not-found
  state, not as a fake question or fake start state.

## Phase 1: Design & Contracts

- [data-model.md](./data-model.md) defines the normalized learner Quiz model and
  result/state transitions.
- [contracts/quiz-api.md](./contracts/quiz-api.md) defines the API boundary,
  validation, permission, and response-safety expectations.
- [quickstart.md](./quickstart.md) defines focused manual and automated checks.

## Project Structure

### Documentation (this feature)

```text
specs/001-learner-quiz/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    └── quiz-api.md
```

### Source Code (repository root)

```text
fe/src/app/(authenticated)/exercises/
├── page.tsx
└── [exerciseId]/page.tsx

fe/src/components/features/tracks/learner/
├── ExerciseDetailContainer.tsx
├── ExerciseDetailView.tsx
├── QuizExercisePanel.tsx
├── courseLearningApi.ts
├── types.ts
└── utils.ts

fe/src/services/client/
└── generated OpenAPI client and types (read-only)
```

**Structure Decision**: Keep the established `page → container → view/panel` flow.
The container owns route params, loading, submission, and error state; normalizers
convert transport data into `LearnerExerciseDetail`; the view and Quiz panel render
normalized props only.

## Implementation Phases

### Phase 1: Contract and normalization alignment

1. Verify the generated/live detail contract for `type`, `questionsData`, and
   `targetScore`; if the live contract omits required learner fields, stop and raise
   a backend contract task instead of fabricating values in the FE.
2. Ensure `normalizeExerciseDetail` maps missing/null/malformed question data to a
   safe learner-owned representation, removes `correctAnswer`, and never exposes it.
3. Ensure the auto-grade response is normalized to learner result fields
   `score`, `passed`, `correctCount`, `totalQuestions`, `targetScore`, and
   per-question results.

### Phase 2: Learner Quiz flow

1. Reuse `ExerciseDetailContainer` to load detail and submit answers through the
   existing service wrapper.
2. Render Quiz title, description/overview, questions, and choices through
   `QuizExercisePanel` using internal types.
3. Keep answers selectable before submit, disable controls during submit, and hide
   grading details until a successful response is received.
4. Render score and passed state after submit; render retry for submit failures.
5. Preserve existing PR_REVIEW and FILL_IN_BLANK branches.

### Phase 3: Verification

1. Run focused normalizer checks for missing/null/unknown question data and status
   mapping.
2. Run the quickstart scenarios for success, validation failure, API failure/retry,
   empty/not-found, and no correct-answer leakage.
3. Run the applicable frontend lint/build checks and report unrelated pre-existing
   failures separately.

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Detail response omits Quiz fields | Treat as contract gap; do not fake `questionsData` or start state. |
| No assignment/progress/start endpoint | Keep feature limited to open → answer → submit → result. |
| API status names differ from FE names | Normalize at the adapter boundary; do not pass raw status to views. |
| Correct answer appears in learner payload | Reject/flag contract; never render it before submit. |

## Complexity Tracking

No constitution violations. No new dependency, abstraction, endpoint, or generated
client edit is justified for this feature.
