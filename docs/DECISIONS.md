# Decisions

Why key choices were made, so nobody re-litigates or accidentally reverses them.

## Kept Next.js App Router instead of migrating to Vite + separate Express backend (2026-08-27)

VisionNex's default template for a "SaaS Web App" assumes a `frontend/` (Vite+React) + `backend/` (Express) split. Moneylix is a Next.js 14 App Router monolith instead — pages and API routes colocated under `src/app/`.

**Decision: keep Next.js, don't migrate.** Reasons:
- The app is live with real users; a framework migration is a full rewrite, not a restructuring, and carries risk disproportionate to the benefit of matching a template.
- Next.js's SSR gives SEO benefits a client-only Vite SPA wouldn't, which matters for a consumer finance app that needs organic discovery.
- App Router's file-system routing means route files can't be freely relocated into a `features/` folder the way the template assumes — so "match the template" would require rearchitecting routing itself, not just moving files.
- A `backend/` folder already existed in the repo from an earlier, apparently abandoned attempt at exactly this split — it was never wired to anything (just a stub `package.json` referencing a `server.js` that didn't exist) and was removed rather than resurrected.

## Database: staying on SQLite for production, Postgres later (2026-08-27)

`src/lib/db.postgres.ts` and `prisma/schema.prisma` are fully written and ready, but the live app continues on SQLite (`src/lib/db.ts` via `better-sqlite3`) by product decision. Planned sequence: SQLite now → PostgreSQL locally once real testing starts → cloud-hosted Postgres after that's validated. No live-data migration has been attempted; this was deliberately paused rather than rushed given real user data is at stake.

## Client-side API calls: incremental migration, not a big-bang refactor (2026-08-27)

28+ call sites across 18 files duplicate the same "read token from localStorage → build Authorization header → fetch" pattern. A `src/services/apiClient.ts` layer was added to consolidate this, but existing call sites are being migrated a few at a time (verified via build + live smoke test each round) rather than all at once, because the app has no automated test suite and a live-app regression from a mechanical mass-edit would be hard to catch before a real user hits it.
