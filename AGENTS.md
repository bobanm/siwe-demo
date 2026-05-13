# siwe-demo

Bun workspace monorepo — `Sign-In with Ethereum` demo app.

## Structure

```
apps/
  api/    Express + TypeORM + SQLite (sql.js) + SIWE auth (port 3001)
  web/   Vue 3 + Vite + viem + SIWE
```

## Commands

```bash
# install (root)
bun install

# API backend -- starts via Bun on port 3001
bun run --cwd apps/api start

# web frontend -- dev server (Vite, usually :5173)
bun run --cwd apps/web dev
```

## Key details

- **Backend DB**: SQLite at `~/siwe/siwe.sqlite`, auto-synced by TypeORM + sql.js.
- **Auth flow**: `/message` → SIWE message, `/sign-in` → verify & issue JWT. Routes below `/account`, `/post` require `verifyToken` middleware.
- **Secret (dev)**: hardcoded in `apps/api/src/config.ts`. Do not commit production secrets.
- **Web base path**: `/siwe/` (deployed to nested path on `boban.ninja/siwe`).
- **API URL**: configured in `apps/web/src/config.ts` (`http://localhost:3001`).
- **No test framework** -- tests will be added soon.
- **VSCode launch config**: `Debug API` profile starts `bun apps/api/src/app.ts`.
