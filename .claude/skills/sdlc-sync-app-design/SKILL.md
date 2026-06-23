---
description: Sync one or all screens from the Claude Design project into the local codebase.
disable-model-invocation: true
---

**Claude Design project ID:** Read from `.env` — the value of `CLAUDE_DESIGN_PROJECT_ID`. Read that file at the start of execution and use the value wherever a project ID is required.

**File mapping** (design comp → JSX file):
| Design file | JSX file |
|---|---|
| `01 Login.dc.html` | `src/pages/Login.jsx` |
| `01b My Trips.dc.html` | `src/pages/Trips.jsx` |
| `02 Trip Overview.dc.html` | `src/pages/TripOverview.jsx` |
| `03 Add Expense.dc.html` | `src/pages/AddExpense.jsx` |
| `04 Person Detail.dc.html` | `src/pages/PersonDetail.jsx` |
| `05 Settle Up.dc.html` | `src/pages/SettleUp.jsx` |

## Steps

1. Call `DesignSync.list_files` on the project to get the current list of `.dc.html` files.

2. Present the files as a numbered list and ask the user: "Which screen would you like to sync? Enter a number, or say **all**."

3. For each file to sync:
   a. Call `DesignSync.get_file` to fetch the latest version from Claude Design.
   b. Read the existing local file from `design/` (if it exists).
   c. Diff the two versions to identify what changed structurally or visually. Summarise the changes in plain language before touching any code.
   d. Write the updated file to `design/`.
   e. Look up the corresponding JSX file from the mapping above.
   f. Read the JSX file and apply only the changes identified in step (c). When writing or modifying JSX, always use the shared component library and Tailwind token system described below — never inline what a component already encapsulates.

4. After all files are processed, report a summary: which screens were synced, what changed in each, and which JSX files were updated.

## Shared component library

All shared components live in `src/components/`. Always use these instead of writing raw markup:

| Component | Import | Use for |
|---|---|---|
| `<PageShell maxWidth="...">` | `../components/PageShell` | Outer wrapper (Header + main) on every page |
| `<Avatar name={} color={} size="sm\|md\|lg">` | `../components/Avatar` | Any coloured circle with initials; use `col(i)` from utils for colour |
| `<Button variant="primary\|secondary">` | `../components/Button` | Any `<button>` action element |
| `<ButtonLink to="..." variant="primary\|secondary">` | `../components/Button` | Any `<Link>` that looks like a button |
| `<BackLink to="...">` | `../components/BackLink` | Back-arrow navigation link |
| `<CalloutBanner title sub action>` | `../components/CalloutBanner` | Left-blue-bordered info/CTA box |

## Tailwind token system

Design tokens are defined in `tailwind.config.js`. Always use token names — never raw hex values:

| Token | Use for |
|---|---|
| `panel` | Near-black (`#161616`) — primary text, dark backgrounds |
| `brand` / `brand-hover` / `brand-active` | Blue (`#0f62fe`) — buttons, links, accents |
| `field` / `field-hover` | Light grey backgrounds (`#f4f4f4` / `#e8e8e8`) |
| `subtle` / `strong` / `row` | Border colours (light / medium / row dividers) |
| `muted` | Secondary text (`#525252`) |
| `helper` | Tertiary text (`#6f6f6f`) |
| `success` / `success-bg` | Green for positive balances / success states |
| `danger` | Red for negative balances / errors |
| `badge` / `badge-bg` | Blue badge text / background |

## Rules
- If the local `design/` file is identical to the remote, skip it and say so.
- If no JSX mapping exists for a design file, sync the design file to `design/` and warn that no JSX target is configured.
- Never overwrite JSX business logic (API calls, state, routing) — only apply structural/style changes from the design diff.
- Never use raw hex colour values in JSX — always use a token from the table above.
