# siwe-demo

Bun workspace monorepo -- `Sign-In with Ethereum` demo app.

## Structure

```
apps/
  api/   Hono + TypeORM + SQLite (sql.js) + SIWE auth (port 3000)
  web/   Vue 3 + Vite + viem + SIWE
```

## Commands

```bash
# API backend -- starts via Bun on port 3000
bun run --cwd apps/api start

# web frontend -- dev server (Vite, usually :5173)
bun run --cwd apps/web dev
```

## Key details

- **Backend DB**: SQLite at `~/siwe/siwe.sqlite`, auto-synced by TypeORM + sql.js.
- **Auth flow**: `/message` → SIWE message, `/sign-in` → verify & issue JWT. Routes `/account`, `/post` require `jwtMiddleware`.
- **Secret (dev)**: hardcoded in `apps/api/src/config.ts`. Do not commit production secrets.
- **Web base path**: `/siwe/` (deployed to nested path on `boban.ninja/siwe`).
- **API URL**: configured in `apps/web/src/config.ts` (`http://localhost:3000`).
- **No test framework** -- tests will be added soon.
- **VSCode launch config**: `Debug API` profile starts `bun apps/api/src/app.ts`.
