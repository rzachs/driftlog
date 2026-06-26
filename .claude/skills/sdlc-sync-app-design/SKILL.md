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

1. **Branch check.** Run `git branch --show-current`.
   - If on a `feat/*` branch: stay on it, note the branch name, and proceed.
   - If on `master` / `main`: **stop.** Tell the user: "Design sync must run inside a feature branch. Run `/sdlc-feature <description>` first to create the branch and write the spec, then run `/sdlc-sync-app-design` here."

2. Call `DesignSync.list_files` on the project to get the current list of `.dc.html` files.

3. Present the files as a numbered list and ask the user: "Which screen would you like to sync? Enter a number, or say **all**."

4. For each file to sync:
   a. Call `DesignSync.get_file` to fetch the latest version from Claude Design.
   b. Read the existing local file from `design/` (if it exists). If identical to remote, skip and say so.
   c. Diff the two versions and classify every change as either **visual** or **behavioral** (see classification rules below). Summarise what changed before touching any code.
   d. Write the updated `.dc.html` file to `design/`.
   e. Look up the corresponding JSX file from the mapping above.
   f. Apply **visual changes** to the JSX file immediately — use the shared component library and Tailwind token system below.
   g. For each **behavioral change**, run the spec-gate check (see below) before writing any JSX logic.

5. After all files are processed, report a summary: which screens were synced, what visual changes were applied, and what behavioral changes were spec-gated or flagged.

## Change classification

When diffing a design file, classify each detected change:

**Visual-only** (safe to apply directly):
- Layout, spacing, sizing, typography adjustments
- Colour token changes on existing elements
- Text content changes
- Reordering existing elements
- Adding static/decorative elements (dividers, labels, icons with no action)

**Behavioral** (requires spec-gate before implementation):
- Any new interactive element: button, link, form input, menu, toggle
- Any new modal, drawer, or overlay with state
- Any new navigation flow or route change
- Changes to what an existing action does

## Spec-gate (for behavioral changes)

For each behavioral change detected:

1. Search `specs/features/` for a spec that covers this interaction. A match means the spec's user story or acceptance criteria explicitly describes this action/flow.

2. **If a spec is found:**
   - Apply the visual structure to JSX (the element is rendered, styled correctly)
   - Do NOT wire up API calls, state for the new behavior, or navigation — leave the handler as a no-op stub: `onClick={() => {/* TODO: /sdlc-implement */}}`
   - Report: "Behavioral change applied as visual stub. Spec found: `<path>`. Run `/sdlc-implement <path>` to wire up the logic."

3. **If no spec is found:**
   - Apply the visual structure to JSX as a stub (same as above)
   - Report: "Behavioral change applied as visual stub. No spec found for this interaction. Run `/sdlc-spec '<description>'` to define it, then `/sdlc-rules`, then `/sdlc-implement`."

> **Why stubs, not omissions?** The visual element should appear in the UI so the designer can verify layout and hover states, but the business logic must not exist until the spec is written and reviewed.

## Shared component library

All shared components live in `src/components/`. Always use these instead of writing raw markup:

| Component | Import | Use for |
|---|---|---|
| `<PageShell maxWidth="...">` | `../components/PageShell` | Outer wrapper (Header + main) on every page |
| `<Avatar name={} color={} size="sm\|md\|lg">` | `../components/Avatar` | Any coloured circle with initials; use `col(i)` from utils for colour |
| `<Button variant="primary\|secondary\|danger">` | `../components/Button` | Any `<button>` action element |
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
| `danger` / `danger-bg` | Red for negative balances / errors / delete hover background |
| `badge` / `badge-bg` | Blue badge text / background |

## Rules
- If the local `design/` file is identical to the remote, skip it and say so.
- If no JSX mapping exists for a design file, sync the design file to `design/` and warn that no JSX target is configured.
- **Never implement behavioral logic without a spec** — always stub unspecced behavior.
- Never use raw hex colour values in JSX — always use a token from the table above.
