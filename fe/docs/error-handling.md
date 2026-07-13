# Frontend Error Handling

This project centralizes API error handling. Before adding new API calls, service wrappers, auth refresh behavior, or global error UI, follow the existing flow instead of showing errors ad hoc in components.

## Error Classification & Handling Levels

Error handling is explicitly structured into distinct hierarchy levels:

### 1. Blocking Errors (System / Infrastructure / Auth)
Errors that prevent the user from continuing normally or invalidate the session:
- **Network Offline / Unreachable API**: Handled centrally; prevents requests.
- **401 Unauthorized / `SESSION_EXPIRED`**: Handled centrally by `ApiErrorProvider` (clears tokens and redirects to login).
- **500 Server Crash / Critical Unhandled Exception**: Handled centrally via Error Boundaries or global alert containers.

### 2. Backend-Returned API Errors
Structured errors returned by backend endpoints (`code`, `message`, `status`). These MUST be handled according to the interaction context:

#### A. Global Toast Display (`ADD_TO_ITEMS`)
Use global toasts for background actions, standalone mutations, or general page-level operations where inline display is not applicable:
- Examples: Saving lesson draft fails, updating track metadata fails, deleting an item fails.
- Behavior: Dispatched via `ADD_TO_ITEMS` pipeline action or `UiShowError` global display so `ApiErrorProvider` displays a standardized toast notification.

#### B. Handled at UI Level (Inline / Dialog / Picker Catch)
Use component-level `try/catch` and inline UI feedback for form validation, dialog pickers, or scoped queries where the user can immediately correct their input or retry:
- Examples: Loading resource documents/exercises inside a picker dialog fails, inline form validation errors, search queries inside modals.
- Behavior: Catch the error within the component/hook, display clear inline error messages or empty/retry states within the UI component, and DO NOT spam global toasts.

## Core Flow

Client-side API errors usually go through:

1. `fe/src/services/api-client.ts`
2. `classify(error, response, request)` in `fe/src/services/error-mapper.ts`
3. `pipeline.process(classified)`
4. `UiShowError`
5. `window.dispatchEvent(new CustomEvent('api-error', { detail }))`
6. `fe/src/providers/ApiErrorProvider.tsx`
7. `fe/src/components/ui/containers/ApiErrorContainer.tsx`

`ApiErrorProvider` listens for the `api-error` event, stacks toast errors, clears toasts on route change, auto-dismisses after 5 seconds, and handles `SESSION_EXPIRED` by clearing tokens and redirecting to login.

## Rules For New Code

- Never use empty `catch {}` blocks that silently swallow API errors.
- Use the generated client through existing service wrappers where possible.
- Do not manually show generic API toasts from components when the request already goes through `api-client.ts`.
- Add new global toast cases through pipeline handlers, usually in `add-item-error.ts`.
- Use local component or form state for field-level validation, inline page-specific failures, picker dialog errors, or user-correctable form errors.
- Keep `SESSION_EXPIRED` behavior centralized: clear tokens and redirect to login through `ApiErrorProvider`.
- Server components and server actions should use `serverFetch()` when they need the shared server-side behavior and should handle `ServerResult<T>`.

## Current Error Types

- `HttpError`: low-level HTTP or network-style error.
- `ApiError`: classified API error with `code`, `message`, optional `status`, and optional `requestPath`.
- `UiShowError`: user-facing error code/message intended for global UI display or local catch handling.

## Pipeline Actions

- `ADD_TO_ITEMS`: dispatch as a global toast and continue without throwing a UI error.
- `FINAL_THROW`: dispatch as a global toast and throw `UiShowError` so the caller can catch it.
- `CONTINUE`: pass the current error to later handlers.

