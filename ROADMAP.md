# Roadmap

Near-term priorities. Not a full product plan — see `MONEYLIX_PROJECT_DOCUMENT.md`/`.html` and `SPEC.md` for that.

## Now
- Confirm live deployment status and get PR #1's fixes (migration crash, credential exposure, dashboard empty state) actually deployed — see `SESSION_HANDOFF.md`.

## Next
- Local PostgreSQL testing (`src/lib/db.postgres.ts` is ready — switch the import in `src/lib/db.async.ts` once `DATABASE_URL` points at a local Postgres instance).
- Continue migrating client-side `fetch` call sites onto `src/services/apiClient.ts` (18 files identified, a few migrated as of 2026-08-27 — see `CHANGELOG.md`).

## Later
- Cloud-hosted Postgres, once local testing validates the switch.
- Decide on audit-log coverage beyond the current 4 routes (account deletion, bank-sync).
- Automated test suite — none exists today; every change is currently verified by manual build + live smoke test.
