# Driftlog — Claude Code guide

## Project intent

Driftlog is a **trip expense splitter** and simultaneously a testbed for **AI-augmented SDLC**. The app is the vehicle; the workflow is the experiment. Every SDLC phase (requirements → design → code → tests → docs → deploy → monitoring) is being mapped to an AI workflow and proven out in this repo.

Full plan with phase statuses: [`AI_SDLC_PLAN.md`](./AI_SDLC_PLAN.md)

**`AI_SDLC_PLAN.md` is the single source of truth for phase status.** `README.md` links to it but does not duplicate the table. Whenever phase status changes, update only `AI_SDLC_PLAN.md`.

## Before every git commit

Before staging and committing, always check these three files and update them if the commit touches anything relevant:

| File | Update when... |
|------|---------------|
| `AI_SDLC_PLAN.md` | A phase status changes (built ✅ / validated ✅ / partial 🟡) |
| `CLAUDE.md` | Skills are added/renamed, conventions change, or new workflow rules are introduced |
| `README.md` | Project structure, routes, API endpoints, or slash commands change |

A pre-commit hook (`.claude/hooks/doc-check.ps1`) will remind you automatically if significant files are staged but these docs are not. Do not dismiss the reminder without checking.

**Core principle:** Humans author intent (specs, design comps). AI derives everything downstream (code, tests, docs, release notes). The spec files are the only place behavioral decisions live — AI must never invent behavior that isn't in a spec table.

## Running the app

```bash
npm install

# Development (Vite HMR on :5173, API on :3000)
npm run dev

# Production (build then serve everything from Express on :3000)
npm run build
npm start
```

## Running tests

```bash
# Unit tests (Vitest — no browser, no server)
npm test

# E2E tests (Playwright — builds app, starts server, runs browser)
npx bddgen && npx playwright test                        # all features
npx bddgen && npx playwright test --grep @trips          # one domain
npx bddgen && npx playwright test --grep "Create a trip" # one feature
npx bddgen && npx playwright test --headed               # watch the browser
```

If the test run fails with a locked DB error, kill any running node process first:
```
Stop-Process -Name node -Force
```

## Project structure

| Path | Purpose |
|------|---------|
| `src/pages/` | React page components (one per route) |
| `src/components/` | Shared React components (Header) |
| `src/utils.js` | Shared helpers: `fmt`, `col`, `initials`, `fmtDate` |
| `src/App.jsx` | Route definitions (React Router v6) |
| `design/` | Claude Design comp files (`.dc.html`) — design reference, not served |
| `server.js` | Express server; all API routes are defined here |
| `db.js` | SQLite setup, schema init, thin wrappers `calculateBalances()`, `calculateSettlements()` |
| `calc.js` | Pure business-logic functions: `calculateBalancesFromData()`, `calculateSettlementsFromBalances()` — no DB I/O, tested directly |
| `tests/` | Vitest unit tests — one file per business-rules spec, one `it()` per table row |
| `e2e/features/` | Gherkin `.feature` files — one per feature spec, domain-tagged (`@trips`, `@expenses`, `@balances`, `@settle-up`) |
| `e2e/steps/` | Playwright step definitions — one file per domain, all import from `e2e/fixtures.js` |
| `e2e/fixtures.js` | `createBdd(test)` + `seededTrip` fixture shared by all step files |
| `e2e/global-setup.js` | Deletes `driftlog-test.db` before each E2E run |
| `e2e/cleanup-db.js` | Deletes test DB as part of the webServer startup command |
| `playwright.config.js` | Playwright + playwright-bdd config; webServer builds and starts the app on `:3000` |

## Design sync workflow (SDLC)

UI screens live in a **Claude Design** project (project ID is in `.env` as `CLAUDE_DESIGN_PROJECT_ID`). The `design/` folder mirrors those files locally as `.dc.html` design comps.

**Pulling designer changes → local:**
1. Fetch the updated `.dc.html` from Claude Design using `DesignSync.get_file`
2. Write it to `design/`
3. Identify what changed visually
4. Apply the structural/style change to the corresponding `src/pages/*.jsx` file

**File mapping:**

| Design comp | App file |
|-------------|----------|
| `design/01 Login.dc.html` | `src/pages/Login.jsx` |
| `design/01b My Trips.dc.html` | `src/pages/Trips.jsx` |
| `design/02 Trip Overview.dc.html` | `src/pages/TripOverview.jsx` |
| `design/03 Add Expense.dc.html` | `src/pages/AddExpense.jsx` |
| `design/04 Person Detail.dc.html` | `src/pages/PersonDetail.jsx` |
| `design/05 Settle Up.dc.html` | `src/pages/SettleUp.jsx` |

The `.dc.html` files use the Claude Design runtime (`support.js`, `<x-dc>`, `{{ }}` templates) with static data. The `src/pages/*.jsx` files are the real app with live API calls — never overwrite one with the other directly.

## Specs

`/specs/features/` and `/specs/business-rules/` are the **single source of truth for all behavioral decisions**.

### Before implementing any logic or generating any tests

1. Read the relevant `/specs/business-rules/` file(s)
2. Identify the exact row(s) that cover the case being implemented
3. Cite those rows explicitly before writing any code
4. If no spec row covers the case → **stop and surface the gap to the human** — do not guess or infer

### Rules

- **These folders are human-authored input, not generated output.** Nothing in `/specs/business-rules/` or `/specs/features/` should be created, edited, or filled in by an agent without explicit human review.
- An agent may read and reference spec files freely, but must never write to them autonomously.
- A missing spec row is not a bug to fix — it is an undecided case that needs a human decision first.

## Slash commands

All custom skills are prefixed `sdlc-` to avoid collisions with built-in Claude Code commands. Skills live in `.claude/skills/<name>/SKILL.md`.

### Feature development pipeline

| Command | What it does |
|---------|-------------|
| `/sdlc-spec <description>` | Drafts or updates a feature spec from plain English; detects new vs existing; writes only after approval. Then tells you to run `/sdlc-plan`. |
| `/sdlc-plan <spec-path>` | Reads an approved spec + existing code; checks what's already implemented; outputs implementation + test plan for approval. Then tells you to run `/sdlc-implement`. |
| `/sdlc-implement <spec-path>` | Executes an approved plan: code changes + tests + verify. Idempotency check first — will not re-implement what's already done. |

### Other

| Command | What it does |
|---------|-------------|
| `/sdlc-sync-app-design` | Pulls updated screens from Claude Design and applies changes to the corresponding `src/pages/*.jsx` files |
| `/sdlc-generate-tests <spec-name>` | Generates `tests/<spec-name>.test.js` from `specs/business-rules/<spec-name>.md` — one `it()` per table row, skipping known gaps |
| `/sdlc-generate-e2e <spec-path>` | Generates `e2e/features/<domain>/<feature>.feature` from a feature spec `.md` — one Scenario per AC item, `@wip` on spec-gap scenarios |

## Key conventions

- Vite builds the React SPA to `dist/`; Express serves `dist/` via `express.static`
- All API routes are prefixed `/api/`
- SQLite DB file (`driftlog.db`) is gitignored — run `npm start` to auto-create it on first launch
- E2E tests use a separate `driftlog-test.db` (set via `DB_PATH` env var); seeding is skipped via `SKIP_SEED=true`
- `bddgen` must run before `playwright test` whenever `.feature` files change — it generates `.features-gen/` (gitignored)
- "You" is always the logged-in user's display name in the DB
