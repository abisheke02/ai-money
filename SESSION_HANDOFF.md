# Session Handoff — Moneylix

**Last updated:** 2026-08-27
**Updated by:** Claude (session on branch `claude/money-code-structure-zu24py`)

## Current State
- App runs on Next.js 14 App Router + SQLite (`better-sqlite3`), confirmed working end-to-end locally: login, dashboard, transactions, categories.
- PR #1 (`claude/money-code-structure-zu24py` → `main`) is open with three fixes, none yet confirmed deployed to the live server:
  1. Migration `008_user_isolation.sql` no longer breaks fresh installs (was throwing `FOREIGN KEY constraint failed`, blocking every login on a clean database).
  2. Demo (`demo`/`demo`) and admin (`admin`/`Moneylix@Admin2026`) accounts are never auto-seeded when `NODE_ENV=production`, unless `ADMIN_SEED_PASSWORD` is explicitly set. Both seed password hashes were also silently wrong before this fix (didn't match their documented passwords at all).
  3. Dashboard no longer gets stuck on an infinite loading spinner for accounts with zero businesses; sidebar business switcher shows "Add a business" instead of a permanent "Loading...".
- This restructuring pass added top-level docs (this file, `ARCHITECTURE.md`, `CHANGELOG.md`, `ROADMAP.md`, `docs/DECISIONS.md`), removed the dead `backend/` Express stub, and started a `src/services/` API-call layer.

## In Progress
- `src/services/apiClient.ts` — centralizes the "read token from localStorage → build Authorization header → fetch" pattern that's currently duplicated across 18+ page files. Migrated as a demonstration in a couple of call sites (see `git log`); **not all 18 files are migrated** — the rest is intentionally left for incremental follow-up rather than one large unverified sweep across a live app with no test suite.
- Postgres migration: paused indefinitely by product decision. Plan going forward is SQLite now → PostgreSQL locally once real testing starts → cloud-hosted Postgres after that's validated. `src/lib/db.postgres.ts` and `prisma/schema.prisma` are already written and ready for that switch (see `ARCHITECTURE.md`); no live-data cutover work has been done.

## Known Issues
- **Unconfirmed:** whether the live production server has deployed PR #1's commits, and what `NODE_ENV` is actually set to there. Until confirmed, the pre-fix admin/demo credential exposure risk may still be live.
- Admin login password (`Moneylix@Admin2026`) — the *previous* hardcoded hash never actually matched this password (verified independently), so admin login was silently broken in dev before this session's fix. Now fixed via runtime hashing.
- Only 4 of ~63 API routes call `audit()` (account deletion, bank-sync flows). No decision has been made yet on whether more admin/data-mutating actions should be audited — flagged, not acted on.
- No automated tests exist anywhere in the repo.

## Next Steps
1. Confirm live deployment status (NODE_ENV, whether PR #1 is deployed) and merge PR #1 if not already.
2. Continue migrating `src/services/apiClient.ts` call sites incrementally (a few files at a time, verified via build + live smoke test each time) — not a priority, but the pattern is established.
3. When ready to test PostgreSQL locally: set `DATABASE_URL` in `.env.local`, switch the import in `src/lib/db.async.ts` from `./db` to `./db.postgres`, run migrations, verify.

## Open Questions
- Should the `backend/` Express stub's original intent (a separate backend service) ever be revisited, or is the Next.js monolith the permanent direction? (Assumed: monolith stays — see `docs/DECISIONS.md`.)
