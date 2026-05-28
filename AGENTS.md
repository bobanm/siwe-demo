# siwe-demo

Bun workspace monorepo -- `Sign-In with Ethereum` demo app. Built for deployment on Cloudflare Workers + D1.

## Structure

```
apps/
  api/   Hono + Drizzle + Cloudflare D1 + SIWE auth + JWT
  web/   Vue 3 + Vite + viem
```

## Key details

- **Deployment**: Frontend and backend are deployed together as a single Cloudflare Worker via Workers Assets. Frontend is built to `apps/web/dist/`, served by the `[assets]` binding in `wrangler.toml`. API routes live under `/api/*`.
- **Backend DB**: Cloudflare D1 (`siwe-db`). Locally emulated by Wrangler (SQLite-backed, stored in `.wrangler/`).
- **Auth flow**: `/api/message` → SIWE message, `/api/sign-in` → verify & issue JWT. Routes `/api/account`, `/api/post` require `jwtMiddleware`.
- **Secret (dev)**: stored in `apps/api/.dev.vars` (gitignored). For production, use `wrangler secret put SECRET`.
- **API URL**: defaults to `/api` (same origin). In Vite dev mode, proxied to `http://localhost:8787/api` (Wrangler's default port).
- **Web state management**: `useUserState` composable (singleton) provided via `provide('userState', ...)` in App.vue, consumed via `inject` in child components.
- **Linting**: oxlint at workspace root.
- **Tests**
  - API -- Vitest + Cloudflare Vitest Pool Workers unit and integration tests in `apps/api/test/`.
  - Web app -- Vitest + @vue/test-utils + happy-dom. Unit tests per component + integration test in `apps/web/test/`.

## Database Migrations

Drizzle Kit outputs migrations to `drizzle/<timestamp>_<name>/migration.sql`. Wrangler expects flat `.sql` files in `drizzle/`. Before applying, copy each new migration: `drizzle/<name>/migration.sql` → `drizzle/<name>.sql`. Then run `wrangler d1 migrations apply siwe-db --local`. See README for details.
