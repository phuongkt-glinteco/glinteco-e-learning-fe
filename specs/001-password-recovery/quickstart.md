# Quickstart: Password Recovery Validation

## Prerequisites

- Node dependencies installed in `fe/`.
- Backend API available at the configured frontend API base URL.
- Forgot/reset password endpoints available in the generated client.

## Run Locally

```bash
cd fe
pnpm dev
```

Open the app at the configured local dev URL, normally
`http://localhost:6336`.

## Validation Scenarios

### Forgot Password: Public Route

1. Log out or use a clean browser session.
2. Open `/forgot-password`.
3. Expected: screen renders without redirecting to login first.
4. Expected: no dashboard/sidebar/authenticated layout is visible.

### Forgot Password: Invalid Email

1. Submit with an empty email.
2. Expected: inline required email message appears.
3. Enter malformed email and submit.
4. Expected: inline invalid email message appears.

### Forgot Password: Success

1. Enter a valid email.
2. Submit the form.
3. Expected: submit button shows loading and prevents duplicate submit.
4. Expected: success state tells the user to check their email.
5. Use login CTA.
6. Expected: navigates to `/login`.

### Forgot Password: API Error

1. Force the request to fail through backend/test tooling or network blocking.
2. Submit a valid email.
3. Expected: auth-style error alert appears and the form remains recoverable.

### Reset Password: Missing Token

1. Open `/reset-password`.
2. Expected: invalid or expired link state appears.
3. Expected: password inputs are not shown.
4. Use forgot-password or login CTA.
5. Expected: navigates to the selected public auth route.

### Reset Password: Password Mismatch

1. Open `/reset-password?token=test-token`.
2. Enter a valid new password.
3. Enter a different confirm password.
4. Submit.
5. Expected: inline confirm-password mismatch appears and no request submits.

### Reset Password: Success

1. Open `/reset-password?token=<valid-token>`.
2. Enter matching valid passwords.
3. Submit.
4. Expected: submit button shows loading and prevents duplicate submit.
5. Expected: success state appears with login CTA.

### Reset Password: API Error

1. Open `/reset-password?token=invalid-token`.
2. Enter matching valid passwords.
3. Submit.
4. Expected: error alert appears and offers a recovery path to request a new
   reset link or return to login.

### Navigation Scope

1. Visit authenticated admin, dashboard, learner, and sidebar areas.
2. Expected: forgot/reset password screens are not listed in authenticated
   navigation.

### Responsive Check

1. Test `/forgot-password` and `/reset-password?token=test-token` at mobile and
   desktop widths.
2. Expected: text, buttons, and inputs do not overlap or clip; CTAs remain
   reachable.

## Validation Commands

```bash
cd fe
pnpm lint
pnpm build
```
