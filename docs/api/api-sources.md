# API Sources

- Swagger UI: https://be-teal-tau.vercel.app/api/v1/docs
- OpenAPI JSON: https://be-teal-tau.vercel.app/api/v1/openapi.json
- Local snapshot: `docs/api/openapi.json`

`docs/api/openapi.json` is the local OpenAPI snapshot for AI/Codex to read when working on FE integration.

The live OpenAPI URL is the source of truth. Sync this snapshot from the live URL whenever the backend contract changes.

Do not hand-edit generated client files in `fe/src/services/client/*.gen.ts`. Update the backend Swagger/DTO contract and regenerate the client instead.
