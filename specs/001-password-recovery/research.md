# Research: Password Recovery

## Decision: Use `fe/src/app/(auth)` for route placement

**Rationale**: Existing unauthenticated auth routes are
`fe/src/app/(auth)/login/page.tsx`, `register/page.tsx`, and `logout/page.tsx`.
There is no `(auth)/layout.tsx`, so adding sibling pages will not inherit the
authenticated app shell.

**Alternatives considered**:

- Root `app/forgot-password/page.tsx`: rejected because it separates recovery
  screens from established auth routes.
- `app/(authenticated)/**`: rejected by scope and would require login/app shell.

## Decision: Reuse login/register visual patterns directly

**Rationale**: `LoginPage` and `RegisterPage` define the current public auth
screen language: full-screen wrapper, optional brand panel, logo, card, inline
alerts, labels, rounded inputs, primary submit buttons, and responsive behavior.
No node-specific Figma file key or node id was available for MCP inspection.

**Alternatives considered**:

- New shared auth layout component: deferred to keep implementation small and
  avoid rewriting login/register pages.
- New design system components: rejected because the feature must not invent a
  new visual style.

## Decision: Use React Hook Form and Zod

**Rationale**: Existing auth forms use `useForm` with `zodResolver` and schemas
from `fe/src/schemas/authSchemas.ts`. This matches project validation patterns
and supports inline field errors.

**Alternatives considered**:

- Manual form validation: rejected because it diverges from existing auth forms.
- TanStack Query mutations: rejected because `@tanstack/react-query` is not in
  `fe/package.json`.

## Decision: Use a small auth recovery service wrapper

**Rationale**: The constitution requires generated API responses to stay behind
service/normalizer boundaries. Generated operations exist and are re-exported by
`@/services/api-client`, so React views can call a local service wrapper instead
of generated SDK functions directly.

**Alternatives considered**:

- Direct component calls to generated SDK: rejected by the project constitution.
- Placeholder service: unnecessary because forgot/reset endpoints already exist.

## Decision: Treat success responses as body-independent

**Rationale**: The local OpenAPI snapshot documents 200 responses for forgot and
reset password without requiring a response schema. UI can transition to success
when the service call resolves.

**Alternatives considered**:

- Read message text from backend response: rejected because it would invent a
  response shape not guaranteed by the contract.

## Decision: Do not touch authenticated navigation or layouts

**Rationale**: The feature is public/guest-only. Route access and visual shell
requirements are satisfied entirely in `(auth)` routes and feature auth
components.

**Alternatives considered**:

- Add nav links in sidebar/dashboard: rejected by scope and acceptance criteria.
