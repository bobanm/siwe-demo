# siwe-demo

Bun workspace monorepo — `Sign-In with Ethereum` demo app.

## Structure

```
packages/
  backend/    Express + TypeORM + SQLite (sql.js) + SIWE auth (port 3001)
  frontend/   Vue 3 + Vite + viem + SIWE
```

## Commands

```bash
# install (root)
bun install

# backend — starts via Bun on port 3001
bun run --cwd packages/backend start

# frontend — dev server (Vite, usually :5173)
bun run --cwd packages/frontend dev

# frontend — type-check (vue-tsc), build
bun run --cwd packages/frontend type-check
bun run --cwd packages/frontend build-only
```

## Key details

- **Backend DB**: SQLite at `~/siwe/siwe.sqlite`, auto-synced by TypeORM + sql.js.
- **Auth flow**: `/message` → SIWE message, `/sign-in` → verify & issue JWT. Routes below `/account`, `/post` require `verifyToken` middleware.
- **Secret (dev)**: hardcoded in `packages/backend/src/config.ts`. Do not commit production secrets.
- **Frontend base path**: `/siwe/` (deployed to nested path on `boban.ninja/siwe`).
- **Backend URL**: configured in `packages/frontend/src/config.ts` (`http://localhost:3001`).
- **No test framework** found — repo has no test setup.
- **VSCode launch config**: `Backend` profile starts `bun packages/backend/src/app.ts`.
