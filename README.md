# SIWE Demo

A **Sign-In with Ethereum** demo app built as a Bun workspace monorepo. Features a Hono API backend with Cloudflare D1 + Drizzle ORM, and a Vue 3 frontend with viem for wallet interactions. Targets Cloudflare Workers for deployment; runs locally via Wrangler emulation.

## Prerequisites

- [Bun](https://bun.sh/)
- A Web3 wallet browser extension (e.g., MetaMask, Rabby)

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/bobanm/siwe-demo.git
cd siwe-demo
bun install

# 2. Set up local database
bun run --cwd apps/api drizzle-kit generate
bun run --cwd apps/api wrangler d1 migrations apply siwe-db --local

# 3. [optional] Run data seed
wrangler d1 execute siwe-db --local --file ./apps/api/test/seed-data.sql

# 4. Start both apps (in separate terminals)
bun run --cwd apps/api dev    # Backend via Wrangler on http://localhost:8787
bun run --cwd apps/web dev    # Frontend on http://localhost:5173
```

Open `http://localhost:5173/` in your browser with a Web3 wallet enabled.

> **Note**: During development, the Vite dev server proxies `/api` requests to Wrangler on port 8787.

## Project Structure

```
siwe-demo/
├── apps/
│   ├── api/          # Hono backend + Drizzle + Cloudflare D1 + SIWE auth
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

Cloudflare D1 database (`siwe-db`), managed by Drizzle ORM. Locally emulated by Wrangler (SQLite-backed, stored in `.wrangler/`). See the "Database Migrations" section for the migration workflow.

**Schema:**

| Table | Columns |
|-------|---------|
| `account` | `address` (PK), `username` (unique), `bio` |
| `post` | `id` (PK, autoincrement), `address` (FK), `timestamp`, `content` |

### Scripts

```bash
bun run --cwd apps/api dev          # Start via Wrangler (D1 emulation, port 8787)
bun run --cwd apps/api test         # Run tests
bun run --cwd apps/api typecheck    # TypeScript check
```

### Database Migrations

Drizzle Kit generates migration SQL in timestamped subdirectories under `drizzle/`. Wrangler expects flat `.sql` files in the `migrations_dir`. As a workaround for this incompatibility, each new Drizzle migration must be copied to a flat file before applying:

```bash
# 1. Generate migration SQL (after changing schema.ts)
bun run --cwd apps/api drizzle-kit generate

# 2. Flatten for Wrangler
#    Copy drizzle/<timestamp>_<name>/migration.sql → drizzle/<timestamp>_<name>.sql

# 3. Apply to local D1
bun run --cwd apps/api wrangler d1 migrations apply siwe-db --local
```

## Frontend (`apps/web`)

Vue 3 SPA with viem for Ethereum wallet interactions.

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SIWE_BACKEND_URL` | `/api` | URL of the API backend (same origin by default) |

### Scripts

```bash
bun run --cwd apps/web dev          # Vite dev server (:5173)
bun run --cwd apps/web preview      # Preview production build
bun run --cwd apps/web build        # Production build
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

## Deployment to Cloudflare

Frontend and backend are deployed together as a single Cloudflare Worker via [Workers Assets](https://developers.cloudflare.com/workers/static-assets/binding/). The frontend is built to `apps/web/dist/` and served by the `[assets]` binding in `wrangler.toml`. API routes live under `/api/*`.

### Prerequisites

- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) authenticated (`wrangler login`)
- Cloudflare D1 database created
- JWT secret set via Cloudflare Secrets

### One-time setup

```bash
# Create D1 database (outputs a database_id to add to wrangler.toml)
wrangler d1 create siwe-db

# Apply migrations to remote database
wrangler d1 migrations apply siwe-db --remote

# Set JWT secret for production
wrangler secret put SECRET
```

### Deploy

```bash
# Build frontend and deploy to Cloudflare Workers
bun run deploy
```

> **Warning**: The JWT secret is stored in `apps/api/.dev.vars` for local development only. For production, use Cloudflare Secrets (`wrangler secret put SECRET`).
