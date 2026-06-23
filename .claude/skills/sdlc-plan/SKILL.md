---
description: Read an approved feature spec and the existing codebase, check what's already implemented, and output an implementation + test plan for user approval. Read-only — makes no changes.
disable-model-invocation: true
---

**Usage:** `/sdlc-plan <path to spec file>`
Example: `/sdlc-plan specs/features/expenses/add-expense-even-split.md`

## Steps

1. Read the spec file at `$ARGUMENTS`. If it doesn't exist, list available spec files under `specs/features/` and stop.

2. Read the relevant existing code:
   - `server.js` — all API routes
   - `db.js` — schema and DB wrappers
   - `calc.js` — pure business logic functions
   - `src/App.jsx` — routes
   - Any `src/pages/*.jsx` file relevant to this feature (infer from the spec's user story)
   - Any `tests/*.test.js` file relevant to this feature
   - Any `specs/business-rules/*.md` files referenced in the spec

3. **Already-implemented check**: For each AC item in the spec, assess whether it is already covered:
   - Does the corresponding API route exist in `server.js`?
   - Does the corresponding UI interaction exist in the relevant page component?
   - Does the corresponding business logic exist in `calc.js` or `db.js`?
   - Is there a passing test in `tests/` that covers this AC item?

   If **everything** appears to be already implemented and tested, report this clearly and stop. Tell the user: "This feature appears to already be fully implemented. If you believe something is missing, describe it and run `/sdlc-spec` to update the spec first."

   If **partially implemented**, note clearly what already exists and scope the plan to only what's missing.

4. Draft the implementation plan with two sections:

   **Implementation changes**
   For each file that needs to change, list:
   - File path
   - What to add or modify (specific: route name, function signature, component behaviour)
   - Which AC item it satisfies
   - For any `src/pages/*.jsx` changes: name the shared components to use (see **UI component library** in `CLAUDE.md`) — the plan should say "use `<Button>`" not "add a button element"

   **Test changes**
   For each test file to create or update, list:
   - File path
   - Test cases to add, one per AC item or business-rules row
   - Which spec row each test covers

5. Present the plan to the user. Ask: "Does this plan look right? Reply **yes** to proceed, or tell me what to adjust."

6. After the user reviews, tell them: "If this plan is approved, run `/sdlc-implement $ARGUMENTS` to execute it."

## Rules
- Read only — no file writes, no code changes in this step.
- If an AC item references a business-rules row that does not exist, flag it as a spec gap and exclude it from the plan.
- If the spec is ambiguous about which file should own a piece of logic, surface the ambiguity rather than deciding silently.
- Scope the plan to what is missing only — do not plan re-implementation of things that already work correctly.
