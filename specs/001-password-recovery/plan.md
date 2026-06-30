# Implementation Plan: Password Recovery

**Branch**: `` | **Date**: 2026-06-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-password-recovery/spec.md`

## Summary

Build two public guest auth screens for password recovery: `/forgot-password`
and `/reset-password`. Both pages will live in the existing unauthenticated auth
route group, match the current login/register auth UI, use existing form and
validation patterns, and call existing generated auth operations through a small
auth recovery service wrapper. No admin, dashboard, learner, mentor,
authenticated layout, sidebar, or role navigation files will be modified.

## Technical Context

**Language/Version**: TypeScript 5.8.2 with Next.js 15 App Router

**Primary Dependencies**: Next.js, React 19, Tailwind CSS, React Hook Form,
Zod, `@hookform/resolvers`, `next-intl`, generated OpenAPI client

**Storage**: URL query state for reset token; local component state for
submitting, success, and API error states; no persistent storage

**Testing**: Manual route validation plus `pnpm lint` and `pnpm build` from
`fe/` when implementation is complete

**Target Platform**: Public web frontend in `fe/` for desktop and mobile
browsers

**Project Type**: Next.js frontend feature in `fe/`

**Performance Goals**: Initial auth screens render without authenticated shell
work; submit actions prevent duplicate requests and keep feedback visible

**Constraints**: Existing auth UI consistency, TypeScript, loading/error/empty
states, guest-only route placement, no dashboard/navigation changes, API wrapper
boundary, no generated SDK edits

**Scale/Scope**: Two public auth routes, two feature components, one auth
recovery service wrapper, schema/message updates, and validation docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- UI consistency: PASS. Reuse the existing `(auth)` route group and mirror
  `LoginPage`/`RegisterPage` layout, card, inputs, buttons, inline alerts,
  language toggle, logo treatment, spacing, and responsive behavior.
- TypeScript and generated contract boundaries: PASS. New files are TypeScript.
  Generated SDK files under `fe/src/services/client` are not edited.
- State coverage: PASS. Plan covers default, submitting, success, API error,
  invalid/missing token, validation error, and disabled submit states.
- Role permissions: PASS. Feature is guest-only and excluded from
  `(authenticated)`, admin, dashboard, learner, mentor, sidebar, and role-based
  navigation files.
- API normalization: PASS. React views call a feature service wrapper; the
  wrapper treats success as body-independent and converts/propagates existing
  UI errors without exposing generated DTOs to views.
- Validation: PASS. Implementation should run `pnpm lint` and `pnpm build` from
  `fe/`; manual checks are documented in `quickstart.md`.

## Proposed File Changes

Create:

- `fe/src/app/(auth)/forgot-password/page.tsx`
- `fe/src/app/(auth)/reset-password/page.tsx`
- `fe/src/components/features/auth/ForgotPasswordPage.tsx`
- `fe/src/components/features/auth/ResetPasswordPage.tsx`
- `fe/src/services/auth-recovery.ts`

Modify:

- `fe/src/schemas/authSchemas.ts` to align forgot/reset schemas with existing
  translation keys and add confirm-password refinement for reset form.
- `fe/messages/en.json` and `fe/messages/vi.json` to add page labels,
  validation text, success text, invalid-link text, and API fallback keys.
- `fe/src/components/features/auth/LoginPage.tsx` only to change the existing
  forgot-password anchor from `href="#"` to `href="/forgot-password"`.

Do not touch:

- `fe/src/app/(authenticated)/**`
- `fe/src/components/layout/**` sidebar/navigation files
- Admin, dashboard, learner, mentor pages
- Generated files under `fe/src/services/client/**`

## Route Structure

```text
fe/src/app/(auth)/
|-- login/page.tsx
|-- register/page.tsx
|-- forgot-password/page.tsx
`-- reset-password/page.tsx
```

The `(auth)` group is the confirmed placement because existing public auth
routes already live there and no group layout currently imposes authenticated
shell behavior.

## Component Structure

```text
fe/src/app/(auth)/forgot-password/page.tsx
`-- ForgotPasswordPage

fe/src/app/(auth)/reset-password/page.tsx
`-- Suspense fallback LoadingPage
    `-- ResetPasswordPage
```

`ResetPasswordPage` needs `useSearchParams`, so the route page should wrap it in
`Suspense` like the current login route does.

Both feature components should copy the established auth-screen composition:

- Full-screen `bg-background text-on-surface` wrapper
- `LanguageToggle` in the top-right
- Large-screen brand panel using `/logo.png` and primary/secondary gradient
- Form card using `bg-surface`, `border-outline` or `border-outline-variant`,
  `rounded-xl`, `shadow-sm`, and `p-8`
- Labels, inputs, error text, and submit buttons matching `LoginPage` and
  `RegisterPage`
- Material Symbols for `sync`, `error`, `check_circle`, and password visibility
  where already used

## Form Validation Approach

- Use React Hook Form with `zodResolver`.
- Forgot password schema: required email and valid email using translation keys
  `emailRequired` and `emailInvalid`.
- Reset password schema: required token from query params, required password,
  existing minimum length of 6 characters, required confirm password, and
  confirm-password equality refinement using `confirmPasswordMismatch`.
- Trim email before service submission.
- Disable submit buttons when submitting or when the form is invalid.
- Use `type="email"` for email, `autoComplete="email"`, `type="password"` or
  visible toggle for password, `autoComplete="new-password"` for both password
  fields.

TanStack Query is not in `fe/package.json`; use local component state for this
feature to match current login/register auth forms.

## API Integration Approach

Existing endpoints are available:

- `authControllerForgotPassword` posts `{ email }` to
  `/api/v1/auth/forgot-password`
- `authControllerResetPassword` posts `{ token, password }` to
  `/api/v1/auth/reset-password`

Create `fe/src/services/auth-recovery.ts`:

- Import generated operations from `@/services/api-client`, not directly from
  `@/services/client/sdk.gen`.
- Export `requestPasswordReset(email: string): Promise<void>`.
- Export `resetPassword(input: { token: string; password: string }): Promise<void>`.
- Call each operation with `throwOnError: true`.
- Do not assume a success response body; resolve `void` on success.
- Let existing `UiShowError` handling surface mapped errors; use component-level
  fallback error keys for unknown failures.

No placeholder service is needed because the endpoints already exist.

## UI States

Forgot Password:

- Default: email form, submit button, login link
- Validation error: inline email error with existing error icon treatment
- Loading: disabled submit with spinning `sync` icon
- API error: alert area matching existing auth error style
- Success: check icon, check-email message, login CTA, optional simple resend
  button only if it reuses the same validated email without adding timers

Reset Password:

- Missing token: invalid/expired link state, login and forgot-password CTAs
- Default: password and confirm-password form
- Validation error: inline field errors
- Loading: disabled submit with spinning `sync` icon
- API error: alert area; invalid/expired token errors should guide to request a
  new reset link
- Success: check icon, reset-complete message, login CTA

## Project Structure

### Documentation (this feature)

```text
specs/001-password-recovery/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- ui-contract.md
`-- checklists/
    `-- requirements.md
```

### Source Code (repository root)

```text
fe/src/
|-- app/(auth)/
|   |-- forgot-password/page.tsx
|   `-- reset-password/page.tsx
|-- components/features/auth/
|   |-- ForgotPasswordPage.tsx
|   `-- ResetPasswordPage.tsx
|-- schemas/authSchemas.ts
|-- services/auth-recovery.ts
`-- messages via fe/messages/en.json and fe/messages/vi.json
```

**Structure Decision**: Use `fe/src/app/(auth)` for both public routes; keep
rendering in feature components under `fe/src/components/features/auth`; isolate
API calls in `fe/src/services/auth-recovery.ts`; reuse existing schema and
message files.

## Complexity Tracking

No constitution violations.

## Risks and Assumptions

- Figma MCP is connected, but no file key or node id was provided. The plan
  therefore uses local login/register screens as the concrete visual source.
  If a node-specific Figma URL is supplied later, implementation should inspect
  it before coding and adjust only within the existing auth visual language.
- Existing schemas use raw English messages for forgot/reset password. The
  implementation should normalize these to translation keys so UI messages are
  consistent with login/register.
- Backend success responses have no required body in the local OpenAPI snapshot;
  service methods must not depend on response data.
- The generated error mapper may not have password-recovery-specific keys.
  Components should include safe fallback message keys while preserving existing
  `UiShowError` behavior.

## Manual Testing Checklist

- Visit `/forgot-password` while logged out; page renders without redirect.
- Submit empty email; inline required email message appears.
- Submit malformed email; inline invalid email message appears.
- Submit valid email; button enters loading state and success state appears.
- Force forgot-password API error; alert appears and form remains usable.
- Use login CTA from forgot success state; navigates to `/login`.
- Visit `/reset-password` without `token`; invalid/expired link state appears.
- Visit `/reset-password?token=abc`; reset form appears.
- Submit mismatched passwords; inline mismatch message appears.
- Submit too-short password; inline minimum-length message appears.
- Submit valid matching passwords; loading state then success state appears.
- Force reset API error; alert appears with login/forgot-password recovery path.
- Confirm neither route is visible in sidebar, dashboard, admin, learner, or
  mentor navigation.
- Check mobile width and desktop width for clipped text, overlapping controls,
  and usable buttons.
