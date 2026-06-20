# Driftlog

Trip expense splitter. Log who paid for what, see live balances, and settle up with the fewest possible payments.

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

## Project structure

```
driftlog/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Route definitions
│   ├── utils.js              # Shared helpers (formatting, colours)
│   ├── components/
│   │   └── Header.jsx
│   └── pages/
│       ├── Login.jsx
│       ├── Trips.jsx
│       ├── TripOverview.jsx
│       ├── AddExpense.jsx
│       ├── PersonDetail.jsx
│       └── SettleUp.jsx
├── design/          # Claude Design comp files (.dc.html) — design reference only
├── server.js        # Express server + all API routes
├── db.js            # SQLite schema, queries, balance/settlement logic
├── index.html       # Vite SPA entry point
├── vite.config.mjs
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
| POST | `/api/trips/:id/expenses` | Add an expense |
| GET | `/api/trips/:tripId/members/:memberId/detail` | Per-person breakdown |
| GET | `/api/trips/:id/settle` | Suggested settlement payments |
| POST | `/api/trips/:id/settle` | Record a payment |
| DELETE | `/api/trips/:tripId/settle/:recordId` | Undo a recorded payment |

## Design sync

UI screens are maintained in a [Claude Design](https://claude.ai/design) project and kept in `design/` as `.dc.html` files. When the designer pushes updates, pull them into the project with Claude Code:

> "sync the design files from Claude Design"

To apply a design change to the live app, ask Claude Code to bring the specific change from the relevant `.dc.html` file into the corresponding `src/pages/*.jsx` file.
