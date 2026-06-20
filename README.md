# Driftlog

Trip expense splitter. Log who paid for what, see live balances, and settle up with the fewest possible payments.

## Stack

- **Backend:** Node.js + Express
- **Database:** SQLite (via `better-sqlite3`)
- **Frontend:** Vanilla HTML/CSS/JS, served as static files

## Getting started

```bash
npm install
npm start
```

App runs at `http://localhost:3000`.

## Project structure

```
driftlog/
├── design/          # Claude Design comp files (.dc.html) — design reference only
├── public/          # App HTML pages served by Express
├── server.js        # Express server + all API routes
├── db.js            # SQLite schema, queries, balance/settlement logic
└── package.json
```

## API routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trips` | List all trips |
| POST | `/api/trips` | Create a trip |
| GET | `/api/trips/:id` | Trip detail (members, balances, expenses) |
| POST | `/api/trips/:id/expenses` | Add an expense |
| GET | `/api/trips/:tripId/members/:memberId/detail` | Per-person breakdown |
| GET | `/api/trips/:id/settle` | Suggested settlement payments |
| POST | `/api/trips/:id/settle` | Record a payment |
| DELETE | `/api/trips/:tripId/settle/:recordId` | Undo a recorded payment |

## Design sync

UI screens are maintained in a [Claude Design](https://claude.ai/design) project and kept in `design/` as `.dc.html` files. When the designer pushes updates, pull them into the project with Claude Code:

> "sync the design files from Claude Design"

To apply a design change to the live app HTML, ask Claude Code to bring the specific change from the relevant `.dc.html` file into the corresponding `public/*.html` file.
