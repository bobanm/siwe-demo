# siwe-demo

Bun workspace monorepo -- `Sign-In with Ethereum` demo app, targeting Cloudflare Workers + D1.

## Structure

```
apps/
  api/   Hono + Drizzle + Cloudflare D1 + SIWE auth
  web/   Vue 3 + Vite + viem + SIWE
```

## Commands

```bash
# API backend -- starts via Wrangler (emulates Cloudflare Workers + D1 locally)
bun run --cwd apps/api dev

# web frontend -- dev server (Vite, usually :5173)
bun run --cwd apps/web dev

# lint (oxlint, from workspace root)
bun run lint

# web typecheck & tests (from apps/web)
bun run --cwd apps/web typecheck
bun run --cwd apps/web test
```

## Key details

- **Backend DB**: Cloudflare D1 (`siwe-db`). Locally emulated by Wrangler (SQLite-backed, stored in `.wrangler/`).
- **Auth flow**: `/message` → SIWE message, `/sign-in` → verify & issue JWT. Routes `/account`, `/post` require `jwtMiddleware`.
- **Secret (dev)**: stored in `apps/api/.dev.vars` (gitignored). Do not commit production secrets.
- **Web base path**: `/siwe/` (deployed to nested path on `boban.ninja/siwe`).
- **API URL**: configured via `SIWE_BACKEND_URL` env var. In development, Vite server proxies all `/api` requests to `http://localhost:8787/api` (Wrangler's default port).
- **Web state management**: `useUserState` composable (singleton) provided via `provide('userState', ...)` in App.vue, consumed via `inject` in child components.
- **Linting**: oxlint at workspace root.
- **Tests**
  - API -- Bun unit and integration tests in `apps/api/test/`
  - Web app -- Vitest + @vue/test-utils + happy-dom. Unit tests per component + integration test in `apps/web/test/`.

## Database Migrations

Drizzle Kit outputs migrations to `drizzle/<timestamp>_<name>/migration.sql`. Wrangler expects flat `.sql` files in `drizzle/`. Before applying, copy each new migration: `drizzle/<name>/migration.sql` → `drizzle/<name>.sql`. Then run `wrangler d1 migrations apply siwe-db --local`. See README for details.
