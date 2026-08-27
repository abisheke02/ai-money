# Moneylix (moneyflow)

AI-powered personal & business finance manager — track income/expenses, manage multiple businesses, sync bank transactions, and get AI-driven spending insights.

## Stack

- **Framework:** Next.js 14 (App Router) + TypeScript, Tailwind CSS
- **Database:** SQLite (`better-sqlite3`) for now — PostgreSQL support already built (`src/lib/db.postgres.ts`, `prisma/schema.prisma`) for a future local-testing → cloud migration
- **Auth:** Session tokens via `iron-session` cookies, bcrypt password hashing
- **Payments:** Razorpay
- **Bank sync:** Setu Account Aggregator (India)
- **AI:** Anthropic Claude + Google Gemini (dual-provider), OCR via Tesseract.js
- **Mobile:** Capacitor-wrapped iOS/Android shells (`ios/`, `android/`)

See `ARCHITECTURE.md` for how the pieces fit together.

## Local Setup

```bash
npm install
cp .env.example .env.local   # fill in what you need — see comments in the file for CRITICAL vs OPTIONAL
npm run dev                  # http://localhost:3006
```

No `DATABASE_URL` is required for local dev — the app runs on a local SQLite file (`moneylix.db`, auto-created) and seeds a `demo`/`demo` account and an `admin` account on first boot. **Neither account is ever auto-created when `NODE_ENV=production`** — see `.env.example` for `ADMIN_SEED_PASSWORD`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3006 |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint |

## Docs

- `ARCHITECTURE.md` — how frontend, API routes, and the database layer connect
- `SESSION_HANDOFF.md` — current state, in-progress work, known issues, next steps (update this at the end of any real work session)
- `CHANGELOG.md` — dated log of what shipped
- `ROADMAP.md` — near-term priorities
- `docs/DECISIONS.md` — why key choices were made
