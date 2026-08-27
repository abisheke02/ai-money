# Changelog

Dated log of what shipped. Started 2026-08-27 (backfilled at a high level from git history before that date — entries from here forward should be added per the standard bug-fix workflow: log the fix here and update `SESSION_HANDOFF.md`'s Known Issues).

## 2026-08-27
- Repo hygiene pass: added `ARCHITECTURE.md`, `SESSION_HANDOFF.md`, `ROADMAP.md`, `docs/DECISIONS.md`, filled in the previously-empty `README.md`; removed the dead `backend/` Express stub (unused since inception); started `src/services/apiClient.ts` to consolidate duplicated client-side auth-header/fetch logic.

## 2026-08-26
- Fixed: dashboard showed an infinite loading spinner for any account with zero businesses instead of the existing "Create Your Business" empty state, because `fetchData()` never cleared its own loading flag on early return. Sidebar business switcher showed a permanent "Loading..." for the same accounts.
- Added `focus-visible` ring to the shared `Button` component (previously covered every state except keyboard focus).

## 2026-08-24
- **Security fix:** demo (`demo`/`demo`) and admin (`admin`/`Moneylix@Admin2026`) accounts are no longer auto-seeded when `NODE_ENV=production`, unless `ADMIN_SEED_PASSWORD` is explicitly set. Also fixed: both accounts' hardcoded bcrypt password hashes didn't actually match their documented passwords (verified independently) — now computed at seed time instead of hardcoded.
- **Bug fix:** migration `008_user_isolation.sql` assumed an admin account already existed when assigning business ownership, but the admin account is only seeded *after* all migrations run — so on every fresh install, migration 008 threw `FOREIGN KEY constraint failed` and silently aborted the rest of the migration chain, meaning nobody could log in. Guarded the migration and added a backfill step once the admin account exists.

## 2026-07-05
- Fixed: user registration was silently failing on every signup.
- Bank OTP / manual-add flows moved off raw synchronous DB access onto the async `db.async` layer.
- Added deployment/build tooling and brand assets; fixed `created_at` not being set explicitly on session creation.

## 2026-06-02 – 2026-06-14
- Bank sync (Setu Account Aggregator), recurring transactions, audit logging, and the async DB layer shipped.
- User profile page, account deletion, privacy/terms pages.

## Earlier
- Initial build: landing page, dashboard, transactions, categories, mobile (Capacitor) shell, business switcher.
