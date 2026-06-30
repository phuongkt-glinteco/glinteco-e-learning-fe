# Tasks: Password Recovery

**Input**: Design documents from `/specs/001-password-recovery/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md

**Tests**: No automated tests were explicitly requested. Include manual validation tasks from quickstart.md and run `pnpm lint` / `pnpm build` after implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently. Scope is limited to public guest auth pages only.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase because it touches different files or only reads context
- **[Story]**: Which user story this task belongs to: US1, US2, US3
- Every task includes exact file paths

## Path Conventions

- Public auth routes: `fe/src/app/(auth)/`
- Auth feature components: `fe/src/components/features/auth/`
- Auth validation schemas: `fe/src/schemas/authSchemas.ts`
- Auth recovery API boundary: `fe/src/services/auth-recovery.ts`
- Messages: `fe/messages/en.json`, `fe/messages/vi.json`
- Generated SDK files under `fe/src/services/client/` MUST NOT be edited
- Authenticated/admin/dashboard/sidebar/learner/mentor paths MUST NOT be edited

---

## Phase 1: Setup (Shared Discovery)

**Purpose**: Confirm public auth placement and existing patterns before creating files.

- [ ] T001 Confirm `fe/src/app/(auth)/login/page.tsx` and `fe/src/app/(auth)/register/page.tsx` are the existing public auth route pattern and note that `fe/src/app/(authenticated)/**` must not be modified
- [ ] T002 [P] Inspect `fe/src/components/features/auth/LoginPage.tsx` and `fe/src/components/features/auth/RegisterPage.tsx` for layout, card, input, button, alert, loading, success, and responsive class patterns
- [ ] T003 [P] Inspect `fe/src/schemas/authSchemas.ts` for existing email/password validation keys and password minimum rule
- [ ] T004 [P] Inspect `fe/src/services/api-client.ts` and generated exports for `authControllerForgotPassword` and `authControllerResetPassword` without editing `fe/src/services/client/**`
- [ ] T005 [P] Inspect `fe/messages/en.json` and `fe/messages/vi.json` for existing LoginPage/RegisterPage auth message namespaces and reusable validation keys

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schema, API, and copy boundaries needed before user story components are wired.

**CRITICAL**: No story component should call generated SDK functions directly or define duplicate validation rules.

- [ ] T006 Update `fe/src/schemas/authSchemas.ts` so forgot password uses translation-key messages for required/invalid email and reset password supports token, password, confirmPassword, and confirm-password match validation
- [ ] T007 Create `fe/src/services/auth-recovery.ts` with `requestPasswordReset(email: string): Promise<void>` and `resetPassword(input: { token: string; password: string }): Promise<void>` using exports from `@/services/api-client`
- [ ] T008 Add ForgotPasswordPage and ResetPasswordPage message namespaces and shared validation/error/success keys to `fe/messages/en.json`
- [ ] T009 Add matching ForgotPasswordPage and ResetPasswordPage message namespaces and shared validation/error/success keys to `fe/messages/vi.json`

**Checkpoint**: Shared validation, API wrapper, and localized copy are ready for UI implementation.

---

## Phase 3: User Story 1 - Request Reset Link (Priority: P1) MVP

**Goal**: A guest user can request a password reset link with a valid email and see validation, loading, API error, success, and login CTA states.

**Independent Test**: Open `/forgot-password` while logged out, submit empty/malformed email, submit valid email, force API error, and verify no authenticated shell/sidebar appears.

### UI Tasks

- [ ] T010 [US1] Create `fe/src/components/features/auth/ForgotPasswordPage.tsx` using the existing auth page layout from `fe/src/components/features/auth/LoginPage.tsx`
- [ ] T011 [US1] Add labeled email input, `Send reset link` submit button, and `/login` CTA in `fe/src/components/features/auth/ForgotPasswordPage.tsx`
- [ ] T012 [US1] Implement success confirmation state with check icon, check-email copy, login CTA, and simple resend only if it reuses the submitted email in `fe/src/components/features/auth/ForgotPasswordPage.tsx`

### Validation Tasks

- [ ] T013 [US1] Wire React Hook Form with `zodResolver` and forgot-password schema from `fe/src/schemas/authSchemas.ts` in `fe/src/components/features/auth/ForgotPasswordPage.tsx`
- [ ] T014 [US1] Show inline required/invalid email errors with existing auth error icon and text styling in `fe/src/components/features/auth/ForgotPasswordPage.tsx`

### API Integration Tasks

- [ ] T015 [US1] Call `requestPasswordReset` from `fe/src/services/auth-recovery.ts` and trim email before submit in `fe/src/components/features/auth/ForgotPasswordPage.tsx`
- [ ] T016 [US1] Add submitting state, disabled submit behavior, API error alert, and fallback error key handling in `fe/src/components/features/auth/ForgotPasswordPage.tsx`

### Route Tasks

- [ ] T017 [US1] Create public route `fe/src/app/(auth)/forgot-password/page.tsx` that renders `ForgotPasswordPage` and does not use authenticated layout
- [ ] T018 [US1] Update only the existing forgot-password link in `fe/src/components/features/auth/LoginPage.tsx` from `href="#"` to `href="/forgot-password"`

**Checkpoint**: `/forgot-password` is independently functional as a public guest route.

---

## Phase 4: User Story 2 - Reset Password With Token (Priority: P1)

**Goal**: A guest user with a reset token can enter a new password, confirm it, submit, and see validation, loading, API error, success, and login CTA states.

**Independent Test**: Open `/reset-password?token=test-token`, submit mismatched passwords, submit too-short password, submit valid matching passwords, force API error, and verify no authenticated shell/sidebar appears.

### UI Tasks

- [ ] T019 [US2] Create `fe/src/components/features/auth/ResetPasswordPage.tsx` using the existing auth page layout from `fe/src/components/features/auth/RegisterPage.tsx`
- [ ] T020 [US2] Add labeled new password and confirm password inputs with browser password-manager autocomplete attributes in `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T021 [US2] Add password visibility toggles consistent with `fe/src/components/features/auth/RegisterPage.tsx` in `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T022 [US2] Implement reset success confirmation state with check icon and `/login` CTA in `fe/src/components/features/auth/ResetPasswordPage.tsx`

### Validation Tasks

- [ ] T023 [US2] Read the token from query params with `useSearchParams` and pass it into reset-password form validation in `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T024 [US2] Wire React Hook Form with `zodResolver` and reset-password schema from `fe/src/schemas/authSchemas.ts` in `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T025 [US2] Show inline password required, password minimum length, confirm required, and mismatch errors with existing auth error styling in `fe/src/components/features/auth/ResetPasswordPage.tsx`

### API Integration Tasks

- [ ] T026 [US2] Call `resetPassword` from `fe/src/services/auth-recovery.ts` with `{ token, password }` in `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T027 [US2] Add submitting state, disabled submit behavior, API error alert, invalid/expired-token recovery copy, and fallback error key handling in `fe/src/components/features/auth/ResetPasswordPage.tsx`

### Route Tasks

- [ ] T028 [US2] Create public route `fe/src/app/(auth)/reset-password/page.tsx` with `Suspense` and `LoadingPage` fallback that renders `ResetPasswordPage`

**Checkpoint**: `/reset-password?token=...` is independently functional as a public guest route.

---

## Phase 5: User Story 3 - Handle Missing Reset Token (Priority: P2)

**Goal**: A guest user opening `/reset-password` without a usable token sees a clear invalid/expired link state instead of a password form.

**Independent Test**: Open `/reset-password` and `/reset-password?token=` while logged out and verify invalid-link copy plus `/forgot-password` and `/login` CTAs.

### UI Tasks

- [ ] T029 [US3] Add missing/empty token detection and invalid-link state to `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T030 [US3] Add `/forgot-password` and `/login` CTAs to the invalid-link state in `fe/src/components/features/auth/ResetPasswordPage.tsx`

### Validation Tasks

- [ ] T031 [US3] Ensure `fe/src/components/features/auth/ResetPasswordPage.tsx` does not render password fields or call `resetPassword` when token is missing or empty

**Checkpoint**: `/reset-password` handles missing token without exposing an unusable form.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate scope, accessibility, responsiveness, and build health.

- [ ] T032 Verify no files under `fe/src/app/(authenticated)/**`, `fe/src/components/layout/**`, admin, dashboard, learner, mentor, or generated `fe/src/services/client/**` were modified
- [ ] T033 Check labels, button text, focusable controls, inline errors, and password autocomplete attributes in `fe/src/components/features/auth/ForgotPasswordPage.tsx` and `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T034 Check desktop and mobile responsive behavior for `/forgot-password`, `/reset-password`, and `/reset-password?token=test-token` against `fe/src/components/features/auth/ForgotPasswordPage.tsx` and `fe/src/components/features/auth/ResetPasswordPage.tsx`
- [ ] T035 Run `pnpm lint` from `fe/` and resolve only issues caused by files in `fe/src/app/(auth)/`, `fe/src/components/features/auth/`, `fe/src/schemas/authSchemas.ts`, `fe/src/services/auth-recovery.ts`, and `fe/messages/`
- [ ] T036 Run `pnpm build` from `fe/` and resolve only issues caused by files in `fe/src/app/(auth)/`, `fe/src/components/features/auth/`, `fe/src/schemas/authSchemas.ts`, `fe/src/services/auth-recovery.ts`, and `fe/messages/`
- [ ] T037 Execute manual validation scenarios from `specs/001-password-recovery/quickstart.md` and record any assumptions or backend-dependent limitations in the final implementation report

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Setup. Blocks all user story UI work.
- **US1 Forgot Password**: Depends on Foundational. Delivers MVP public reset-link request.
- **US2 Reset Password With Token**: Depends on Foundational. Can run after or alongside US1 only if shared files are not being edited concurrently.
- **US3 Missing Token**: Depends on US2 `ResetPasswordPage.tsx` structure.
- **Polish**: Depends on US1, US2, and US3 completion.

### Story Dependencies

- **US1**: Independent after Foundational.
- **US2**: Independent after Foundational.
- **US3**: Depends on the reset password component created for US2.

### Within Each Story

- UI shell before route wiring.
- Validation before API submission.
- API integration before loading/error/success verification.
- Route creation after component exists.

---

## Parallel Opportunities

- Setup inspection tasks T002-T005 can run in parallel.
- After T006-T009, US1 and US2 can be implemented by separate agents if they coordinate shared message/schema files first.
- T033 and T034 can run in parallel after all routes and components exist.

### Parallel Example: Setup

```text
Task: "Inspect LoginPage/RegisterPage auth UI patterns"
Task: "Inspect authSchemas validation keys"
Task: "Inspect auth API exports"
Task: "Inspect message namespaces"
```

### Parallel Example: User Stories After Foundation

```text
Task: "Implement ForgotPasswordPage in fe/src/components/features/auth/ForgotPasswordPage.tsx"
Task: "Implement ResetPasswordPage in fe/src/components/features/auth/ResetPasswordPage.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 tasks T010-T018.
3. Validate `/forgot-password` independently.

### Incremental Delivery

1. Add US1 forgot password request flow.
2. Add US2 reset password with token flow.
3. Add US3 missing-token handling.
4. Run scope, accessibility, responsive, lint, build, and quickstart validation.

---

## Manual Test Checklist

- [ ] Open `/forgot-password` while logged out; it renders without redirect and without authenticated shell/sidebar.
- [ ] Submit empty email on `/forgot-password`; required email inline error appears.
- [ ] Submit malformed email on `/forgot-password`; invalid email inline error appears.
- [ ] Submit valid email on `/forgot-password`; loading then success state appears.
- [ ] Force forgot-password API error; auth-style error alert appears and retry remains possible.
- [ ] Use `/login` CTA from forgot-password states; navigation works.
- [ ] Open `/reset-password`; invalid/expired link state appears and password fields are hidden.
- [ ] Open `/reset-password?token=test-token`; reset form appears.
- [ ] Submit mismatched passwords; confirm-password mismatch inline error appears.
- [ ] Submit too-short password; minimum length inline error appears.
- [ ] Submit valid matching passwords; loading then success state appears.
- [ ] Force reset-password API error; auth-style error alert appears with recovery path.
- [ ] Confirm routes are not listed in admin, dashboard, learner, mentor, sidebar, or role navigation.
- [ ] Check mobile and desktop layouts for clipped text, overlapping controls, and reachable CTAs.

## Notes

- Do not implement admin/dashboard/sidebar navigation changes.
- Do not edit generated SDK files under `fe/src/services/client/**`.
- Do not rewrite login/register pages beyond the single forgot-password link update in `LoginPage.tsx`.
