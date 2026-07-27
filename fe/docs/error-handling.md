# Frontend Error Handling

This project centralizes API error handling. Before adding new API calls, service wrappers, auth refresh behavior, or global error UI, follow the existing flow instead of showing errors ad hoc in components.

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

## Important Files

- `fe/src/services/errors.ts`: shared error classes: `HttpError`, `ApiError`, and `UiShowError`.
- `fe/src/services/error-mapper.ts`: classifies raw errors and runs the handler pipeline.
- `fe/src/services/add-item-error.ts`: registers global toast-style errors.
- `fe/src/services/ui-show-error.ts`: registers mapped UI errors that should be thrown/displayed.
- `fe/src/services/api-client.ts`: configures the generated client, token storage, token refresh, interceptor behavior, and client-side error dispatch.
- `fe/src/services/server-fetch.ts`: server-side fetch wrapper that returns `ServerResult<T>` instead of dispatching browser events.
- `fe/src/providers/ApiErrorProvider.tsx`: browser event listener and global error state.
- `fe/messages/en.json` and `fe/messages/vi.json`: localized `ApiErrors` copy.

## Rules For New Code

- Use the generated client through existing service wrappers where possible.
- Do not manually show generic API toasts from components when the request already goes through `api-client.ts`.
- Add new global toast cases through pipeline handlers, usually in `add-item-error.ts`.
- Use local component or form state only for field-level validation, inline page-specific failures, or user-correctable form errors.
- Keep `SESSION_EXPIRED` behavior centralized: clear tokens and redirect to login through `ApiErrorProvider`.
- Server components and server actions should use `serverFetch()` when they need the shared server-side behavior and should handle `ServerResult<T>`.
- When adding a new error code, add matching localized copy under `ApiErrors` in both message files.

## Current Error Types

- `HttpError`: low-level HTTP or network-style error.
- `ApiError`: classified API error with `code`, `message`, optional `status`, and optional `requestPath`.
- `UiShowError`: user-facing error code/message intended for global UI display or local catch handling.

## Pipeline Actions

- `ADD_TO_ITEMS`: dispatch as a global toast and continue without throwing a UI error.
- `FINAL_THROW`: dispatch as a global toast and throw `UiShowError` so the caller can catch it.
- `CONTINUE`: pass the current error to later handlers.

## Server-Side Notes

`serverFetch()` cannot dispatch browser events. It classifies errors, attempts token refresh for 401 responses when a refresh token exists, redirects to `/auth/logout` if refresh fails, and otherwise returns:

```ts
{ success: false, error: { code, message, status } }
```
