# Feature Specification: Password Recovery

**Feature Branch**: `001-password-recovery`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Build public guest auth screens for Forgot Password and Reset Password in the existing Next.js e-learning frontend. The routes are /forgot-password and /reset-password, must be accessible without login, must follow the existing public/auth route group, must not appear in admin/sidebar/dashboard navigation, and must match existing auth UI and Figma reference while reusing current form, validation, API, and UI patterns."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Request Reset Link (Priority: P1)

An unauthenticated user who cannot access their account requests a password reset
link by entering their email address.

**Why this priority**: Password recovery starts with this journey. Without a
successful reset-link request, users cannot proceed to set a new password.

**Roles & Permissions**: Available to guest/public users without login. The
screen must not be implemented inside admin, learner, mentor, dashboard,
authenticated layout, sidebar, or role-based navigation areas, and must not
expose authenticated-only content.

**Independent Test**: A tester can open the forgot password screen, submit a
valid email, observe a submitting state, and then see instructions to check
their email plus a way back to login.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user is on the forgot password screen, **When**
   they enter a valid email and submit, **Then** the screen shows a loading
   state and then a success message telling them to check their email.
2. **Given** an unauthenticated user submits an empty or malformed email,
   **When** validation runs, **Then** the screen keeps the user on the form and
   shows a clear inline email error.
3. **Given** the reset-link request fails, **When** the service returns an
   error, **Then** the screen shows a clear recoverable error message and allows
   the user to submit again.

---

### User Story 2 - Reset Password With Token (Priority: P1)

An unauthenticated user who opened a reset link enters a new password and
confirmation, then completes password reset.

**Why this priority**: This completes the password recovery flow and restores
account access.

**Roles & Permissions**: Available to guest/public users through a reset link
without login. The screen must not be implemented inside admin, learner, mentor,
dashboard, authenticated layout, sidebar, or role-based navigation areas, and no
authenticated-only content is visible.

**Independent Test**: A tester can open the reset password screen with a token,
enter matching valid passwords, submit, observe a loading state, and then see a
success state with a login call to action.

**Acceptance Scenarios**:

1. **Given** a user opens the reset password screen with a token, **When** they
   enter a valid new password and matching confirmation, **Then** the screen
   submits the reset request and shows a success state with a login call to
   action.
2. **Given** a user enters mismatched passwords, **When** validation runs,
   **Then** the screen shows an inline confirm-password mismatch message and
   does not submit.
3. **Given** the reset request fails because the token is invalid or expired,
   **When** the service returns an error, **Then** the screen shows a clear
   error and provides a way to return to login or request a new reset link.

---

### User Story 3 - Handle Missing Reset Token (Priority: P2)

An unauthenticated user opens the reset password screen without a token and
needs a clear path to recover.

**Why this priority**: Users may arrive from an expired bookmark, copied URL, or
broken email link. The screen must not show a unusable password form.

**Roles & Permissions**: Available to guest/public users without login. No
admin, learner, mentor, dashboard, sidebar, or authenticated-only content is
visible.

**Independent Test**: A tester can open the reset password screen without query
parameters and confirm the invalid-link state appears with a safe next action.

**Acceptance Scenarios**:

1. **Given** a user opens the reset password screen without a token, **When**
   the page loads, **Then** the screen shows an invalid or expired link message
   instead of the reset form.
2. **Given** a user sees the invalid-link state, **When** they choose the next
   action, **Then** they can navigate to login or forgot password.

### Edge Cases

- The forgot password email is empty, malformed, or contains leading/trailing
  spaces.
- The forgot password request returns a generic failure, validation failure, or
  rate-limit style error.
- The reset password URL has no token, an empty token, or a token containing
  URL-encoded characters.
- The new password is empty or shorter than the existing minimum password rule.
- The confirm password is empty or does not match the new password.
- The reset request returns an invalid, expired, or already-used token error.
- A user submits a form multiple times quickly; duplicate submission must be
  prevented while the request is in progress.
- The screens are used on a narrow mobile viewport.
- A user opens either route while not logged in; the route must render without
  redirecting to login first.
- A user checks admin/sidebar/dashboard navigation; these recovery screens must
  not be listed there.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a forgot password screen reachable at
  `/forgot-password`.
- **FR-001a**: The forgot password screen MUST be a public/guest route that
  does not require login and follows the existing unauthenticated auth route
  grouping.
- **FR-002**: System MUST allow a user to enter an email address and request a
  password reset link.
- **FR-003**: System MUST require the email field and reject malformed email
  addresses before submitting.
- **FR-004**: System MUST show an in-progress submitting state while requesting
  a reset link.
- **FR-005**: System MUST disable reset-link submission while the form is invalid
  or currently submitting.
- **FR-006**: System MUST show a success state after a reset-link request is
  accepted, telling the user to check their email.
- **FR-007**: System MUST provide a clear way from the forgot password screen
  and success state back to login.
- **FR-008**: System SHOULD allow resend from the success state only if it can
  reuse the same validated email and follows existing auth UX patterns.
- **FR-009**: System MUST provide a reset password screen reachable at
  `/reset-password`.
- **FR-009a**: The reset password screen MUST be a public/guest route that does
  not require login and follows the existing unauthenticated auth route
  grouping.
- **FR-010**: System MUST read the reset token from the page URL and treat a
  missing or empty token as an invalid or expired link.
- **FR-011**: System MUST show an invalid or expired link state when no usable
  token is present, with a call to action back to login or forgot password.
- **FR-012**: System MUST allow a user with a token to enter a new password and
  confirmation.
- **FR-013**: System MUST require the new password and enforce the existing
  project password rule: minimum 6 characters.
- **FR-014**: System MUST require confirm password and reject values that do not
  match the new password.
- **FR-015**: System MUST show an in-progress submitting state while resetting
  the password.
- **FR-016**: System MUST disable password reset submission while the form is
  invalid or currently submitting.
- **FR-017**: System MUST show a success state after the password is reset, with
  a clear login call to action.
- **FR-018**: System MUST show clear API error messages for both screens without
  losing the user's safe form context.
- **FR-019**: System MUST preserve existing auth screen visual consistency,
  including layout, spacing, typography, card style, input style, button style,
  validation message style, colors, and responsive behavior.
- **FR-020**: System MUST provide labels for all inputs and readable inline
  validation or error messages.
- **FR-021**: System MUST support browser password managers for new-password and
  confirm-password fields.
- **FR-022**: System MUST keep learner/admin authenticated content unavailable
  from both unauthenticated recovery screens.
- **FR-023**: System MUST not require hand edits to generated client files.
- **FR-024**: System MUST NOT place these screens under authenticated,
  dashboard, admin, learner, or mentor route groups.
- **FR-025**: System MUST NOT add these screens to admin, learner, mentor,
  dashboard, sidebar, or role-based navigation menus.
- **FR-026**: System MUST limit changes to password recovery routes, components,
  validation, messages, and auth API/service integration unless a tiny public
  route configuration update is required.

### UI States *(mandatory for frontend features)*

- **Loading**: Submit buttons show an in-progress indicator and forms prevent
  duplicate submission while a request is active.
- **Error**: Inline validation messages appear beside invalid fields; service
  errors appear in an alert area matching existing auth error treatment and allow
  correction or retry.
- **Empty**: The reset password screen without a usable token shows an
  invalid-link state rather than an empty form.
- **Success**: Forgot password shows check-email guidance and login navigation;
  reset password shows reset-complete guidance and login navigation.

### API & Normalization *(include if feature reads or mutates data)*

- **Endpoints/SDK functions**: Existing generated client operations are present
  for forgot password and reset password based on local API metadata.
- **Normalizer boundary**: UI must call these operations through an auth service
  or existing API wrapper layer, not directly from React views if a wrapper is
  available or introduced for this feature.
- **Contract risks**: The feature assumes success can be represented without
  relying on a specific response body. Error text must come from existing error
  handling or a documented fallback because backend error envelopes may vary.
- **Generated SDK impact**: No generated SDK edits are expected. If the contract
  is stale, regenerate from OpenAPI rather than editing generated files.

### Key Entities *(include if feature involves data)*

- **Password Reset Request**: The submitted email address used to request a reset
  link.
- **Password Reset Submission**: The reset token, new password, and confirmation
  used to complete password reset.
- **Recovery Screen State**: The user-visible state for default form,
  submitting, success, service error, validation error, and invalid link.
- **Public Auth Route**: A guest-accessible recovery route that belongs with the
  existing unauthenticated auth screens and is excluded from authenticated
  navigation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can request a password reset link with a valid email in
  under 60 seconds.
- **SC-002**: A user can complete password reset from a valid link in under 2
  minutes.
- **SC-003**: 100% of required validation cases show an inline message without
  submitting the form.
- **SC-004**: 100% of specified screen states are demonstrable during review:
  default, submitting, success, API error, invalid link, and disabled submit.
- **SC-005**: The screens remain usable on desktop and mobile widths without
  clipped controls or inaccessible navigation.
- **SC-006**: Both recovery routes load for guest users without authentication
  and do not appear in authenticated navigation areas during review.

## Assumptions

- The feature is for unauthenticated account recovery and does not change
  learner/admin authorization rules after login.
- The existing unauthenticated auth route group is the correct placement for
  these pages when present.
- Mentor-specific areas, if present, are out of scope in the same way as admin
  and learner areas.
- Existing auth UI in login and registration screens is the primary visual
  source if a node-specific Figma URL is unavailable during implementation.
- Existing password policy is minimum 6 characters because current auth
  validation uses that rule.
- The backend exposes forgot password and reset password operations through the
  current generated client metadata.
- Successful forgot password submission may show the same success message even
  if the email is unknown, to avoid account enumeration when the backend follows
  that security pattern.
- Implementation planning must inspect a node-specific Figma design if one is
  provided; no Figma file key or node id was available while drafting this spec.
