# SIWE Demo

A **Sign-In with Ethereum** demo app built as a Bun workspace monorepo. Features a Hono API backend with SQLite + Drizzle ORM, and a Vue 3 frontend with viem for wallet interactions.

## Prerequisites

- [Bun](https://bun.sh/)
- A Web3 wallet browser extension (e.g., MetaMask, Rabby)

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/bobanm/siwe-demo.git
cd siwe-demo
bun install

# 2. Create the database and apply migrations
bun run --cwd apps/api drizzle-kit migrate

# 3. Start both apps (in separate terminals)
bun run --cwd apps/api start    # Backend on http://localhost:3000
bun run --cwd apps/web dev      # Frontend on http://localhost:5173
```

Open `http://localhost:5173/siwe/` in your browser with a Web3 wallet enabled.

## Project Structure

```
siwe-demo/
├── apps/
│   ├── api/          # Hono backend + Drizzle + SQLite + SIWE auth
│   └── web/          # Vue 3 + Vite + viem frontend
├── package.json      # Root workspace config
└── AGENTS.md         # Project conventions
```

## Backend (`apps/api`)

Hono-based REST API with Sign-In with Ethereum (EIP-4361) authentication.

### API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/message` | No | Generate SIWE message for signing |
| `POST` | `/sign-in` | No | Verify signature, issue JWT |
| `GET` | `/account` | JWT | Get current user profile |
| `POST` | `/account` | JWT | Update username / bio |
| `GET` | `/post` | JWT | List all posts (newest first) |
| `POST` | `/post` | JWT | Create a new post (max 1000 chars) |

### Auth Flow

1. Frontend requests a SIWE message via `GET /message?address=...&chainId=...&origin=...`
2. User signs the message in their wallet
3. Frontend sends signature via `POST /sign-in`
4. Backend verifies the signature cryptographically and returns a JWT (HS256, 2-hour expiry)
5. Subsequent requests to `/account` and `/post` include `Authorization: Bearer <token>`

### Database

SQLite database stored at `~/siwe/siwe.sqlite`, managed by Drizzle ORM. Run `drizzle-kit migrate` to create the SQLite file and apply all pending migrations.

**Schema:**

| Table | Columns |
|-------|---------|
| `account` | `address` (PK), `username` (unique), `bio` |
| `post` | `id` (PK, autoincrement), `address` (FK), `timestamp`, `content` |

### Scripts

```bash
bun run --cwd apps/api start        # Start server on port 3000
bun run --cwd apps/api test:all     # Run tests
bun run --cwd apps/api typecheck    # TypeScript check
```

## Frontend (`apps/web`)

Vue 3 SPA with viem for Ethereum wallet interactions.

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SIWE_BACKEND_URL` | `http://localhost:3000` | URL of the API backend |

### Scripts

```bash
bun run --cwd apps/web dev          # Vite dev server (:5173)
bun run --cwd apps/web preview      # Preview production build
bun run --cwd apps/web build-only   # Production build
bun run --cwd apps/web typecheck    # Vue TypeScript check
bun run --cwd apps/web test         # Run Vitest tests
bun run --cwd apps/web test:watch   # Tests in watch mode
```

### State Management

Shared reactive state via the `useUserState` composable, provided through Vue's `provide`/`inject` pattern. Tracks `isSignedIn`, `accessToken`, `address`, `username`, and `bio`.

## Development

### Linting

```bash
bun run lint    # Runs oxlint across the workspace
```

## Deployment

The frontend is configured with a base path of `/siwe/` for deployment to a nested route (e.g., `boban.ninja/siwe`). Set `SIWE_BACKEND_URL` to point to your production API.

> **Warning**: The JWT secret is hardcoded in `apps/api/src/config.ts` for development. Change this before deploying to production.
