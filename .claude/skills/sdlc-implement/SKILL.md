---
description: Execute an approved implementation plan: make code changes, create or update tests, verify with a test run. Checks idempotency first — will not re-implement what is already done.
disable-model-invocation: true
---

**Usage:** `/sdlc-implement <path to spec file>`
Example: `/sdlc-implement specs/features/expenses/add-expense-even-split.md`

## Steps

1. Read the spec file at `$ARGUMENTS`. If it doesn't exist, stop.

2. Read all relevant files this feature touches:
   - `server.js`, `db.js`, `calc.js`, `src/App.jsx`
   - Relevant `src/pages/*.jsx` files (infer from the spec's user story)
   - Relevant `tests/*.test.js` files
   - Business rules — check BOTH locations:
     - **Embedded in the feature file** (`## Business rules` section with an inline table) — use these directly
     - **Referenced external files** (any `specs/business-rules/*.md` paths listed in the feature file) — read each one in full

3. **Idempotency check**: Before changing anything, assess whether this feature is already implemented:
   - For each AC item in the spec, check whether the corresponding code and test already exist.
   - If **fully implemented and tested**: report what was found and stop. Tell the user: "This feature appears to already be implemented. No changes were made. If something is wrong or missing, run `/sdlc-plan $ARGUMENTS` to identify the gap first."
   - If **partially implemented**: report exactly what exists, then proceed to implement only the missing parts.

4. **Implement code changes** — for each missing piece:
   - Before writing any logic, cite the exact AC item or business-rules row it satisfies.
   - If a case arises that has no spec AC item or business-rules row, stop and surface the gap. Do not guess or invent behaviour.
   - Follow the existing patterns in each file being edited (naming conventions, style, structure).
   - **For any JSX changes:** follow the **UI component library** section in `CLAUDE.md` — use shared components (`PageShell`, `Avatar`, `Button`/`ButtonLink`, `BackLink`, `CalloutBanner`) and named Tailwind tokens (`bg-brand`, `text-muted`, etc.). Never write raw hex values or inline class strings that duplicate an existing component.

5. **Create or update tests**:
   - One `it()` per AC item or business-rules row.
   - Each test description includes `[AC: <item>]` or `[row N]` to trace it back to the spec.
   - Import from `calc.js` using plain fixtures — no DB, no server.
   - Skip any AC item that maps to a known gap in the business-rules file.

6. Run `npm test` and report results. If any test fails, diagnose and fix before reporting done.

7. **Update docs** — before committing, check these three files and update any that are affected by this change:
   - `README.md` — if new API routes, pages, or slash commands were added
   - `CLAUDE.md` — if new shared components, conventions, or skills were introduced
   - `AI_SDLC_PLAN.md` — if a step's built/validated status changed

8. **Commit, push, and open a PR**:
   - Stage all changed files (be explicit — do not use `git add -A`)
   - Commit with message format: `feat(<scope>): <short description>` and a body summarising what was implemented and which spec it satisfies
   - Push the branch to origin
   - Open a PR with `gh pr create`. PR body must include:
     - **Summary** — bullet list of what was built
     - **Spec** — path to the spec file
     - **Tests** — list of new/updated test files and what they cover
     - **Test plan** — manual checklist of what a reviewer should verify
     - `🤖 Generated with [Claude Code](https://claude.com/claude-code)`

9. Report a summary: list each AC item, whether it was already implemented or newly added, which test covers it, and the PR URL.

## Rules
- Spec-gated: cite the spec row before writing any logic. No invented behaviour.
- Never re-implement what already works — only add what is missing (enforced by step 3).
- If a business-rules gap is encountered mid-implementation, stop that piece and flag it to the user. Do not skip silently.
- Always run `npm test` at the end — do not report done without a passing test run.
- Always open a PR at the end — do not report done without a PR URL.
