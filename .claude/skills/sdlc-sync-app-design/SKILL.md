---
description: Sync one or all screens from the Claude Design project into the local design/ folder and report what changed. Read-only on JSX — all code changes go through /sdlc-plan and /sdlc-implement.
disable-model-invocation: true
---

**Claude Design project ID:** Read from `.env` — the value of `CLAUDE_DESIGN_PROJECT_ID`. Read that file at the start of execution and use the value wherever a project ID is required.

**File mapping** (design comp → JSX file — for reference only):
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
   c. Write the updated `.dc.html` file to `design/`.
   d. Diff the two versions and classify every change as either **visual** or **behavioral** (see classification rules below).

5. Report a summary for each synced screen:
   - Which `.dc.html` file was updated
   - Bulleted list of **visual changes** detected
   - Bulleted list of **behavioral changes** detected
   - "Run `/sdlc-plan <spec-path>` to plan the implementation — it will translate both visual and behavioral changes into JSX."

## Change classification

When diffing a design file, classify each detected change:

**Visual-only:**
- Layout, spacing, sizing, typography adjustments
- Colour token changes on existing elements
- Text content changes
- Reordering existing elements
- Adding static/decorative elements (dividers, labels, icons with no action)

**Behavioral:**
- Any new interactive element: button, link, form input, menu, toggle
- Any new modal, drawer, or overlay with state
- Any new navigation flow or route change
- Changes to what an existing action does

## Rules
- **This skill is read-only on JSX.** Never write to `src/`. All JSX changes — visual and behavioral — go through `/sdlc-plan` and `/sdlc-implement`.
- If the local `design/` file is identical to the remote, skip it and say so.
- If no JSX mapping exists for a design file, still sync the `.dc.html` to `design/` and note that no JSX target is configured.
