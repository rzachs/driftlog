# Driftlog — Claude Code guide

## Project intent

Driftlog is a **trip expense splitter** and simultaneously a testbed for **AI-augmented SDLC**. The app is the vehicle; the workflow is the experiment. Every SDLC phase (requirements → design → code → tests → docs → deploy → monitoring) is being mapped to an AI workflow and proven out in this repo.

Full plan with phase statuses: [`AI_SDLC_PLAN.md`](./AI_SDLC_PLAN.md)

**`AI_SDLC_PLAN.md` is the single source of truth for phase status.** `README.md` links to it but does not duplicate the table. Whenever phase status changes, update only `AI_SDLC_PLAN.md`.

## Before every git commit

Before staging and committing, always check these three files and update them if the commit touches anything relevant:

| File | Update when... |
|------|---------------|
| `AI_SDLC_PLAN.md` | A step's built/validated status changes, or an open decision is resolved |
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

# Spec-coverage check (no browser, no server)
node scripts/check-spec-coverage.js

# E2E tests (Playwright — builds app, starts server, runs browser)
npx bddgen && npx playwright test --grep-invert "@wip"   # all features (skip known spec gaps)
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
| `src/components/` | Shared React components: `Header`, `Avatar`, `Button`/`ButtonLink`, `BackLink`, `PageShell`, `CalloutBanner` |
| `src/utils.js` | Shared helpers: `fmt`, `col`, `initials`, `fmtDate`, `fmtDateRange`, `fmtBal` |
| `src/App.jsx` | Route definitions (React Router v6) |
| `design/` | Claude Design comp files (`.dc.html`) — design reference, not served |
| `server/index.js` | Express server; all API routes are defined here |
| `server/db.js` | SQLite setup, schema init, thin wrappers `calculateBalances()`, `calculateSettlements()` |
| `server/calc.js` | Pure business-logic functions: `calculateBalancesFromData()`, `calculateSettlementsFromBalances()`, `calculatePersonDetail()` — no DB I/O, tested directly |
| `tests/` | Vitest unit tests — one file per business-rules spec, one `it()` per table row |
| `scripts/` | Dev/CI utilities — `check-spec-coverage.js` (step 10b); run locally with `node scripts/check-spec-coverage.js` |
| `e2e/features/` | Gherkin `.feature` files — one per feature spec, domain-tagged (`@auth`, `@trips`, `@expenses`, `@balances`, `@settle-up`) |
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

### Two-tier business rules structure

Business rules live in one of two places depending on whether they are shared:

| Location | When to use |
|---|---|
| `specs/business-rules/<domain>.md` | Rules **shared across multiple features** (e.g. `balance-calculation.md` is referenced by view-balances, view-person-detail, record-payment, and undo-payment) |
| Embedded `## Business rules` table in the feature file | Rules **unique to one feature** that no other feature will ever reference (e.g. OAuth flow rules in `login-with-google.md`) |

A feature file may use both: reference an external file for shared rules AND embed a table for its own unique rules.

### Before implementing any logic or generating any tests

1. Read the feature spec file. Check its `## Business rules` section for:
   - Any **embedded table** — this is authoritative for rules unique to that feature
   - Any **references to `specs/business-rules/*.md`** — read each referenced file in full
2. Identify the exact row(s) that cover the case being implemented
3. Cite those rows explicitly before writing any code
4. If no spec row covers the case → **stop and surface the gap to the human** — do not guess or infer

### Rules

- **These folders are human-authored input, not generated output.** Nothing in `/specs/business-rules/` or `/specs/features/` should be created, edited, or filled in by an agent without explicit human review.
- An agent may read and reference spec files freely, but must never write to them autonomously.
- A missing spec row is not a bug to fix — it is an undecided case that needs a human decision first.

## Conversation logs

When the user asks to "save the conversation", write a summary to `.claude/conversations/YYYY-MM-DD-<short-slug>.md`. Include: what was done, key decisions, and next steps. Match the format of existing files in that folder.

## Slash commands

All custom skills are prefixed `sdlc-` to avoid collisions with built-in Claude Code commands. Skills live in `.claude/skills/<name>/SKILL.md`.

### Per-feature cycle

| Step | Command | What it does |
|------|---------|-------------|
| 1 | `/sdlc-feature <description>` | Creates a `feat/<slug>` branch, then drafts a **combined artifact** — user story + acceptance criteria + business rules table — from plain English. One draft, one approval gate. Writes only after approval. |
| 3 | `/sdlc-sync-app-design` | Pulls the design comp for this feature's screen. Must be on a feature branch — run `/sdlc-feature` first. Visual changes applied immediately; behavioral changes stubbed pending `/sdlc-implement`. *(UI-touching features only.)* |
| 4 | `/sdlc-plan <spec-path>` | Reads the approved spec (+ design diff if applicable); returns an implementation + test plan citing specific spec rows; waits for approval. |
| 5–7 | `/sdlc-implement <spec-path>` | Executes the approved plan: code changes, unit tests (one per business-rules row), E2E tests (one per AC item). Idempotency check first. |
| 8 | `/sdlc-review <spec-path>` | Runs the built-in `/code-review` (high effort) then adds a spec-fidelity pass: every code change must trace to a spec row, every spec row must have an implementation and a test. Untraceable behavior and unimplemented rows are blockers. |

See `AI_SDLC_PLAN.md` for the full 10-step cycle including the two human checkpoints (Steps 2 and 9).

### Bug fixes

| Command | What it does |
|---------|-------------|
| `/sdlc-fix-bug <issue-number>` | Creates a `fix/<issue-number>-<slug>` branch, fixes the bug, runs tests, verifies visually, commits, opens a PR linked to the issue, comments with root cause + PR link, and labels it `fix-ready`. Human merges the PR to auto-close the issue. |

### Utilities

| Command | What it does |
|---------|-------------|
| `/sdlc-generate-tests <spec-name>` | Generates `tests/<spec-name>.test.js` from a spec file — one `it()` per business-rules row, skipping known gaps |
| `/sdlc-generate-e2e <spec-path>` | Generates `e2e/features/<domain>/<feature>.feature` from a spec file — one Scenario per AC item, `@wip` on spec-gap scenarios |

## UI component library

**This is the authoritative reference for all JSX generation.** Any skill or workflow that writes or modifies React pages must follow these rules — never inline what a shared component already encapsulates, and never use raw hex values.

### Shared components (`src/components/`)

| Component | Props | Use for |
|---|---|---|
| `<PageShell maxWidth="...">` | `maxWidth` (string, default `"768px"`), `subtitle` | Outer wrapper on every page — renders `<Header>` + `<main>` |
| `<Avatar name color size>` | `name` (string), `color` (hex from `col()`), `size` (`sm`/`md`/`lg`) | Any coloured circle with initials; get `color` from `col(i)` in `utils.js` |
| `<Button variant?>` | `variant` (`primary` default / `secondary` / `danger`), standard button props | Any `<button>` action element |
| `<ButtonLink to variant?>` | `to` (route string), same variants as Button | Any React Router `<Link>` that looks like a button |
| `<BackLink to>` | `to` (route string) | Back-arrow navigation link at the top of inner pages |
| `<CalloutBanner title sub action>` | `title`, `sub` (strings), `action` (ReactNode) | Left-blue-bordered info/CTA panel |

### Tailwind design tokens (`tailwind.config.js`)

Never use raw hex values in JSX. Always use a named token:

| Token | Hex | Use for |
|---|---|---|
| `panel` | `#161616` | Primary text colour, dark backgrounds |
| `brand` / `brand-hover` / `brand-active` | `#0f62fe` / `#0050e6` / `#002d9c` | Buttons, links, focus rings |
| `field` / `field-hover` | `#f4f4f4` / `#e8e8e8` | Input/form backgrounds, hover states |
| `subtle` / `strong` / `row` | `#c6c6c6` / `#8d8d8d` / `#e0e0e0` | Border colours — light / medium / row dividers |
| `muted` | `#525252` | Secondary / helper text |
| `helper` | `#6f6f6f` | Tertiary text, footnotes |
| `success` / `success-bg` | `#24a148` / `#defbe6` | Positive balances, settled state |
| `danger` / `danger-bg` | `#da1e28` / `#fff1f1` | Negative balances, errors / delete button hover background |
| `badge` / `badge-bg` | `#0043ce` / `#d0e2ff` | "Active" badge text / background |

## Key conventions

- Vite builds the React SPA to `dist/`; Express serves `dist/` via `express.static`
- All API routes are prefixed `/api/`
- SQLite DB file (`driftlog.db`) is gitignored — run `npm start` to auto-create it on first launch
- E2E tests use a separate `driftlog-test.db` (set via `DB_PATH` env var); seeding is skipped via `SKIP_SEED=true`
- `bddgen` must run before `playwright test` whenever `.feature` files change — it generates `.features-gen/` (gitignored)
- "You" is always the logged-in user's display name in the DB
