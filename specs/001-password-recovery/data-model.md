# Data Model: Password Recovery

## Password Reset Request

Represents a guest user's request to receive a password reset link.

### Fields

- `email`: string, required, valid email address, trimmed before submission

### Validation Rules

- Email is required.
- Email must be valid.
- Submit is disabled while invalid or submitting.

### State Transitions

```text
default -> validation_error
default -> submitting -> success
default -> submitting -> api_error -> submitting
success -> submitting (optional resend only if implemented simply)
success -> login navigation
```

## Password Reset Submission

Represents a guest user's attempt to set a new password from a reset link.

### Fields

- `token`: string, required, read from URL query params
- `password`: string, required, minimum 6 characters
- `confirmPassword`: string, required, must match `password`

### Validation Rules

- Missing or empty token shows invalid-link state and does not render the form.
- Password is required.
- Password must be at least 6 characters.
- Confirm password is required.
- Confirm password must match password.
- Submit is disabled while invalid or submitting.

### State Transitions

```text
route_load -> invalid_link
route_load -> default
default -> validation_error
default -> submitting -> success
default -> submitting -> api_error -> submitting
success -> login navigation
invalid_link -> forgot-password navigation
invalid_link -> login navigation
```

## Recovery Screen State

Tracks user-visible UI feedback for both pages.

### Values

- `default`: form is available
- `validation_error`: field-level validation message is visible
- `submitting`: request is in progress, submit is disabled
- `api_error`: service-level error alert is visible
- `success`: confirmation content and login CTA are visible
- `invalid_link`: reset token is missing or empty

## Public Auth Route

Represents route-level placement and access constraints.

### Fields

- `path`: `/forgot-password` or `/reset-password`
- `routeGroup`: `(auth)`
- `requiresLogin`: false
- `navigationVisibility`: excluded from authenticated sidebar/dashboard/admin,
  learner, mentor, and role-based navigation
