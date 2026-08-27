# Architecture

## Shape

Moneylix is a **Next.js 14 App Router monolith** — there is no separate frontend/backend process. Pages and API routes are colocated under `src/app/`:

```
src/app/
├── page.tsx                    # landing page
├── auth/**/page.tsx            # login/register/reset pages
├── dashboard/**/page.tsx       # the protected app (client components)
├── admin/**/page.tsx           # admin panel
└── api/**/route.ts             # every backend endpoint (GET/POST/PUT/DELETE handlers)
```

This is a real constraint, not a style choice: Next's App Router uses **file-system routing** — a route only exists at the URL matching its file path. `src/app/api/transactions/route.ts` cannot be moved into a `features/transactions/` folder without breaking `/api/transactions`. Any future reorganization has to work within this, not against it.

## Request flow

```
Browser (dashboard/*.tsx, client components)
  → fetch('/api/...', { headers: { Authorization: 'Bearer <token>' } })
  → src/app/api/**/route.ts   (validates via src/lib/schemas.ts, reads Bearer token)
  → src/lib/db.async.ts        (thin async wrapper)
  → src/lib/db.ts              (better-sqlite3, actual queries + migrations)
```

Auth is a bearer session token (not cookies) stored client-side in `localStorage['moneylix_session_token']` and manually attached to every `fetch` call. There's no shared client-side API wrapper yet — every page currently duplicates the "read token, build header, fetch" pattern (`src/services/apiClient.ts` was added to start consolidating this; not all call sites are migrated yet — see `SESSION_HANDOFF.md`).

## Data layer

- **Active:** `src/lib/db.ts` — SQLite via `better-sqlite3`, file `moneylix.db` in the project root. Runs `.sql` migrations from `src/migrations/` on first connection, then seeds dev-only demo/admin accounts (never in `NODE_ENV=production` unless `ADMIN_SEED_PASSWORD` is explicitly set).
- **Wrapper:** `src/lib/db.async.ts` — every API route imports this, not `db.ts` directly. It just wraps the sync SQLite calls in `Promise`s.
- **Prepared, not active:** `src/lib/db.postgres.ts` — a feature-complete async Postgres implementation with the same `dbQuery.all/get/run/transaction` interface. Nothing imports it yet. Switching databases is meant to be a one-line import change in `db.async.ts` (per that file's own header comment) once `DATABASE_URL` points at a real Postgres instance.
- `prisma/schema.prisma` — the target relational schema for Postgres. Not wired to runtime code (no `@prisma/client` import anywhere) — it exists as the schema Postgres migrations should match, not as an active ORM.

## Domain grouping today

There's no `src/features/` folder — domain code is grouped implicitly by route folder name instead: `dashboard/transactions/` + `api/transactions/`, `dashboard/categories/` + `api/categories/`, `dashboard/bank/` + `api/bank/*`, etc. Shared cross-cutting concerns live in `src/lib/`:

- `src/lib/contexts/` — React Context providers (`BusinessContext`, `CurrencyContext`, `PlanContext`)
- `src/lib/auth/` — password hashing, session helpers
- `src/lib/schemas.ts` / `src/lib/schemas/` — Zod validation
- `src/lib/setu/` — Setu Account Aggregator (bank sync) client
- `src/lib/audit.ts` — audit log writer (`audit_logs` table). Currently wired into only 4 routes (account deletion + bank-sync flows) — expanding coverage to more admin/data-mutating actions is a deliberate future decision, not done here.

## Known architectural debt (tracked, not silently fixed)

- No `services/` layer for client-side API calls until this pass — 28+ call sites across 18 files duplicate the same token-fetch pattern. See `src/services/apiClient.ts` and `SESSION_HANDOFF.md` for migration status.
- `backend/` folder (removed in this pass) was a dead stub from an earlier, abandoned separate-Express-backend attempt — never wired to anything.
- No automated test suite exists. Every change in this codebase is currently verified by manual build + live smoke-test, not CI.
