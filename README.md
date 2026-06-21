# Driftlog

Trip expense splitter. Log who paid for what, see live balances, and settle up with the fewest possible payments.

---

## AI SDLC experiment

Driftlog doubles as a testbed for **AI-augmented software development**. The app is a vehicle — the real goal is proving out an end-to-end SDLC where every phase is either automated or meaningfully augmented by AI, with humans authoring intent (specs, designs) and AI handling all downstream derivation (code, tests, docs, release notes).

Full plan and rationale: [`AI_SDLC_PLAN.md`](./AI_SDLC_PLAN.md)

### Phase progress

| # | Phase | Approach | Status |
|---|---|---|---|
| 1 | Business rules | `/specs/business-rules/` — human-authored decision tables | 🟡 Scaffold done |
| 2 | Feature specification | `/specs/features/` — user stories + AC linked to rules | 🟡 Scaffold done |
| 3 | Design → code | `DesignSync` + `/sync-app-design` — comp changes → React | ✅ Done |
| 4 | Spec-gated implementation | AI cites spec row before writing any logic | 🟡 Convention set, not enforced |
| 5 | Testing pipeline | Spec table row → test stub; feature AC → Playwright E2E | ⬜ Not started |
| 6 | Spec-aware code review | `/code-review` cross-referenced against spec tables | 🟡 Skill exists, spec-aware mode not built |
| 7 | Documentation generation | Docs derived from specs + routes; never hand-edited | ⬜ Not started |
| 8 | CI/CD & deployment | Spec coverage gate + AI-generated release notes | ⬜ Not started |
| 9 | Monitoring & maintenance | Production bugs classified as spec gap vs. spec violation | ⬜ Not started |

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
