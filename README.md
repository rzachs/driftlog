# Driftlog

Trip expense splitter. Log who paid for what, see live balances, and settle up with the fewest possible payments.

---

## AI SDLC experiment

Driftlog doubles as a testbed for **AI-augmented software development**. The app is a vehicle — the real goal is proving out an end-to-end SDLC where every phase is either automated or meaningfully augmented by AI, with humans authoring intent (specs, designs) and AI handling all downstream derivation (code, tests, docs, release notes).

Full plan and rationale: [`AI_SDLC_PLAN.md`](./AI_SDLC_PLAN.md)

### Phase progress

See [`AI_SDLC_PLAN.md`](./AI_SDLC_PLAN.md) for the full phase breakdown and current built/validated status.

---

## Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (Node built-in `node:sqlite`)

## Getting started

```bash
npm install
```

**Development** — React dev server (HMR) on port 5173, API on port 3000:
```bash
npm run dev
```

**Production** — build then serve everything from Express on port 3000:
```bash
npm run build
npm start
```

**Unit tests** (Vitest — no browser):
```bash
npm test
```

**E2E tests** (Playwright — builds app, opens Chromium):
```bash
npx bddgen && npx playwright test                        # all features
npx bddgen && npx playwright test --grep @trips          # one domain
npx bddgen && npx playwright test --grep "Create a trip" # one feature
npx bddgen && npx playwright test --headed               # watch the browser
```

## Project structure

```
driftlog/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Route definitions
│   ├── utils.js              # Shared helpers (fmt, col, initials, fmtDate, fmtDateRange, fmtBal)
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Avatar.jsx        # Coloured circle with initials
│   │   ├── Button.jsx        # Button + ButtonLink (primary / secondary variants)
│   │   ├── BackLink.jsx      # Back-arrow navigation link
│   │   ├── PageShell.jsx     # Outer wrapper (Header + main) used by every page
│   │   └── CalloutBanner.jsx # Left-bordered CTA banner (settle-up prompt)
│   └── pages/
│       ├── Login.jsx
│       ├── Trips.jsx
│       ├── TripOverview.jsx
│       ├── AddExpense.jsx
│       ├── PersonDetail.jsx
│       └── SettleUp.jsx
├── specs/
│   ├── features/             # Human-authored user stories + acceptance criteria
│   │   ├── trips/            # Create trip, view trips, rename trip
│   │   ├── expenses/         # Add expense (even split, custom split)
│   │   ├── balances/         # View trip balances, expense history, person breakdown
│   │   └── settle-up/        # View suggested payments, record payment, undo payment
│   └── business-rules/       # Human-authored behavioral decision tables (source of truth)
│       ├── balance-calculation.md
│       ├── settlement-calculation.md
│       ├── trips.md
│       ├── expenses.md
│       ├── person-detail.md
│       ├── balance-display.md
│       ├── settlement-recording.md
│       └── _template.md
├── design/                   # Claude Design comp files (.dc.html) — design reference only
├── .claude/
│   └── skills/               # Custom Claude Code skills (slash commands)
├── server/
│   ├── index.js              # Express server + all API routes
│   ├── db.js                 # SQLite schema, seed data, thin DB wrappers for balances/settlements
│   └── calc.js               # Pure business-logic functions (no DB): calculateBalancesFromData, calculateSettlementsFromBalances, calculatePersonDetail
├── tests/
│   ├── balance-calculation.test.js    # One test per spec row in specs/business-rules/balance-calculation.md
│   ├── settlement-calculation.test.js # One test per spec row in specs/business-rules/settlement-calculation.md
│   └── person-detail.test.js          # One test per spec row in specs/business-rules/person-detail.md
├── e2e/
│   ├── features/             # Gherkin .feature files (one per feature spec, domain-tagged)
│   │   ├── trips/
│   │   ├── expenses/
│   │   ├── balances/
│   │   └── settle-up/
│   ├── steps/                # Playwright step definitions (one file per domain)
│   ├── fixtures.js           # createBdd(test) + seededTrip fixture
│   ├── global-setup.js       # Deletes test DB before each run
│   └── cleanup-db.js         # DB cleanup run inside webServer command
├── playwright.config.js      # Playwright + playwright-bdd config
├── index.html                # Vite SPA entry point
├── AI_SDLC_PLAN.md           # AI SDLC experiment — phase-by-phase plan and progress
├── CLAUDE.md                 # Claude Code instructions for this repo
├── vite.config.mjs
├── vitest.config.mjs
├── tailwind.config.js
└── package.json
```

## Routes

| Path | Page |
|------|------|
| `/` | Login |
| `/trips` | Your trips list |
| `/trips/:id` | Trip overview (balances + expenses) |
| `/trips/:id/add-expense` | Add an expense |
| `/trips/:tripId/members/:memberId` | Per-person breakdown |
| `/trips/:tripId/settle` | Settle up |

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a trip |
| GET | `/api/trips/:id` | Trip detail (members, balances, expenses) |
| PATCH | `/api/trips/:id` | Rename a trip |
| DELETE | `/api/trips/:id` | Delete a trip |
| POST | `/api/trips/:id/expenses` | Add an expense |
| GET | `/api/trips/:tripId/members/:memberId/detail` | Per-person breakdown |
| GET | `/api/trips/:id/settle` | Suggested settlement payments |
| POST | `/api/trips/:id/settle` | Record a payment |
| DELETE | `/api/trips/:tripId/settle/:recordId` | Undo a recorded payment |

## Slash commands

Custom Claude Code skills live in `.claude/skills/`. All are prefixed `sdlc-` to avoid collisions with built-in Claude Code commands.

### Per-feature cycle

| Step | Command | What it does |
|------|---------|-------------|
| 1 | `/sdlc-feature <description>` | Creates a `feat/<slug>` branch, then drafts a combined spec + business rules artifact from plain English; one approval gate; writes only after approval |
| 3 | `/sdlc-sync-app-design` | Pulls design comps; applies visual changes immediately; stubs behavioral changes pending an approved spec *(UI features only)* |
| 4 | `/sdlc-plan <spec-path>` | Reads the approved spec; returns an implementation + test plan citing spec rows; waits for approval |
| 5–7 | `/sdlc-implement <spec-path>` | Executes the plan: code + unit tests (one per business-rules row) + E2E tests (one per AC item); idempotency check first |
| 8 | `/sdlc-review <spec-path>` | Runs `/code-review` (high effort) then adds a spec-fidelity pass — every change must trace to a spec row, every spec row must be implemented and tested |

### Bug fixes

| Command | What it does |
|---------|-------------|
| `/sdlc-fix-bug <issue-number>` | Reads a GitHub issue, fixes the bug, runs tests, verifies visually, commits, comments with root cause + SHA, labels `fix-ready` — human closes after validating |

### Utilities

| Command | What it does |
|---------|-------------|
| `/sdlc-generate-tests <spec-name>` | Generates `tests/<spec-name>.test.js` from a spec file — one `it()` per business-rules row |
| `/sdlc-generate-e2e <spec-path>` | Generates `e2e/features/<domain>/<feature>.feature` from a spec file — one Scenario per AC item |

## Design sync

UI screens are maintained in a [Claude Design](https://claude.ai/design) project and kept in `design/` as `.dc.html` files. When the designer pushes updates, pull them into the project with Claude Code:

> "sync the design files from Claude Design"

To apply a design change to the live app, ask Claude Code to bring the specific change from the relevant `.dc.html` file into the corresponding `src/pages/*.jsx` file.
