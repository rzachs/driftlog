# Driftlog — Claude Code guide

## Running the app

```bash
npm install
npm start
# → http://localhost:3000
```

## Project structure

| Path | Purpose |
|------|---------|
| `public/` | App HTML pages (index, trips, trip-overview, add-expense, person-detail, settle-up) |
| `design/` | Claude Design comp files (`.dc.html`) — design reference, not served by Express |
| `server.js` | Express server; all API routes are defined here |
| `db.js` | SQLite setup, schema init, `calculateBalances()`, `calculateSettlements()` |

## Design sync workflow (SDLC)

UI screens live in a **Claude Design** project (project ID `CLAUDE_DESIGN_PROJECT_ID`). The `design/` folder mirrors those files locally as `.dc.html` design comps.

**Pulling designer changes → local:**
1. Fetch the updated `.dc.html` from Claude Design using `DesignSync.get_file`
2. Write it to `design/`
3. Identify what changed visually
4. Apply the structural/style change to the corresponding `public/*.html` file

**File mapping:**

| Design comp | App file |
|-------------|----------|
| `design/01 Login.dc.html` | `public/index.html` |
| `design/01b My Trips.dc.html` | `public/trips.html` |
| `design/02 Trip Overview.dc.html` | `public/trip-overview.html` |
| `design/03 Add Expense.dc.html` | `public/add-expense.html` |
| `design/04 Person Detail.dc.html` | `public/person-detail.html` |
| `design/05 Settle Up.dc.html` | `public/settle-up.html` |

The `.dc.html` files use the Claude Design runtime (`support.js`, `<x-dc>`, `{{ }}` templates) with static data. The `public/*.html` files are the real app with live API calls — never overwrite one with the other directly.

## Key conventions

- Express serves only `public/` via `express.static`
- All API routes are prefixed `/api/`
- SQLite DB file (`driftlog.db`) is gitignored — run `npm start` to auto-create it on first launch
- "You" is always the logged-in user's display name in the DB
