# UI Contract: Password Recovery

## Public Routes

### `/forgot-password`

Access:

- Public guest route.
- Must render without login.
- Must not use authenticated layout or sidebar.

Default state:

- Shows page title and explanatory copy.
- Shows labeled email field.
- Shows `Send reset link` submit button.
- Shows link or CTA back to `/login`.

Validation:

- Empty email shows required email message.
- Malformed email shows invalid email message.
- Invalid form does not submit.

Submitting:

- Submit button is disabled.
- Loading indicator/text is visible.
- Duplicate submit is prevented.

Success:

- Shows check-email confirmation.
- Shows CTA back to `/login`.
- Optional resend may be present only as a simple repeat of the same validated
  email request.

API error:

- Shows an alert matching auth error styling.
- Keeps the user on the screen with a retry path.

## `/reset-password`

Access:

- Public guest route.
- Must render without login.
- Must not use authenticated layout or sidebar.

Missing token:

- If `token` query param is missing or empty, show invalid/expired link state.
- Provide CTA to `/forgot-password` and/or `/login`.
- Do not show password fields.

Default state:

- Shows page title and explanatory copy.
- Shows labeled new password field.
- Shows labeled confirm password field.
- Shows submit button.

Validation:

- Empty password shows required password message.
- Password shorter than 6 characters shows minimum length message.
- Empty confirm password shows required confirm-password message.
- Mismatched confirm password shows mismatch message.
- Invalid form does not submit.

Submitting:

- Submit button is disabled.
- Loading indicator/text is visible.
- Duplicate submit is prevented.

Success:

- Shows reset-complete confirmation.
- Shows CTA to `/login`.

API error:

- Shows an alert matching auth error styling.
- Invalid or expired token errors guide user toward requesting a new reset link.

## Non-Goals

- No admin, dashboard, learner, mentor, sidebar, or authenticated navigation
  entries.
- No generated SDK edits.
- No login/register rewrite beyond linking existing forgot-password text to
  `/forgot-password`.
