# Driftlog — Claude Code guide

## Running the app

```bash
npm install

# Development (Vite HMR on :5173, API on :3000)
npm run dev

# Production (build then serve everything from Express on :3000)
npm run build
npm start
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
| `db.js` | SQLite setup, schema init, `calculateBalances()`, `calculateSettlements()` |

## Design sync workflow (SDLC)

UI screens live in a **Claude Design** project (project ID `CLAUDE_DESIGN_PROJECT_ID`). The `design/` folder mirrors those files locally as `.dc.html` design comps.

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

`/specs/business-rules/` and `/specs/features/` must be read as context before implementing any logic or generating tests.

**These folders are human-authored input, not generated output.** Nothing in `/specs/business-rules/` or `/specs/features/` should be created, edited, or filled in by an agent without explicit human review. An agent may reference them but must not write to them autonomously.

## Key conventions

- Vite builds the React SPA to `dist/`; Express serves `dist/` via `express.static`
- All API routes are prefixed `/api/`
- SQLite DB file (`driftlog.db`) is gitignored — run `npm start` to auto-create it on first launch
- "You" is always the logged-in user's display name in the DB
