# siwe-demo

Bun workspace monorepo -- `Sign-In with Ethereum` demo app.

## Structure

```
apps/
  api/   Hono + Drizzle + SQLite + SIWE auth (port 3000)
  web/   Vue 3 + Vite + viem + SIWE
```

## Commands

```bash
# API backend -- starts via Bun on port 3000
bun run --cwd apps/api start

# web frontend -- dev server (Vite, usually :5173)
bun run --cwd apps/web dev

# lint (oxlint, from workspace root)
bun run lint

# web typecheck & tests (from apps/web)
bun run --cwd apps/web typecheck
bun run --cwd apps/web test
```

## Key details

- **Backend DB**: SQLite at `~/siwe/siwe.sqlite`, auto-synced by Drizzle.
- **Auth flow**: `/message` → SIWE message, `/sign-in` → verify & issue JWT. Routes `/account`, `/post` require `jwtMiddleware`.
- **Secret (dev)**: hardcoded in `apps/api/src/config.ts`. Do not commit production secrets.
- **Web base path**: `/siwe/` (deployed to nested path on `boban.ninja/siwe`).
- **API URL**: configured via `VITE_BACKEND_URL` env var, falls back to `http://localhost:3000`.
- **Web state management**: `useUserState` composable (singleton) provided via `provide('userState', ...)` in App.vue, consumed via `inject` in child components.
- **Linting**: oxlint at workspace root.
- **Tests**
  - API -- Bun unit and integration tests in `apps/api/test/`
  - Web app -- Vitest + @vue/test-utils + happy-dom. Unit tests per component + integration test in `apps/web/test/`.
