---
description: Fix a GitHub issue by ID — investigates root cause, fixes code, runs tests, verifies visually, commits, comments on the issue, and labels it fix-ready for human validation.
disable-model-invocation: true
---

**Usage:** `/sdlc-fix-bug <issue-number>`
Example: `/sdlc-fix-bug 1`

## Steps

1. **Read the issue** using `gh issue view $ARGUMENTS --repo rzachs/driftlog`. Extract: title, body, any comments. If the issue is already labelled `fix-ready` or is closed, stop and tell the user. Then assign it to the authenticated user: `gh issue edit $ARGUMENTS --repo rzachs/driftlog --add-assignee @me`.

2. **Identify affected files** from the issue body. If the body names specific files and line numbers, start there. Otherwise grep the codebase to locate the relevant code.

3. **Diagnose the root cause** — read the affected files in full. State the root cause in one sentence before writing any fix. If the issue body already contains a root cause analysis, verify it against the current code before proceeding (the code may have changed since the issue was filed).

4. **Fix the code** — make the minimal change that resolves the bug. Do not refactor unrelated code, change behaviour not described in the issue, or add features. Follow the existing patterns in each file:
   - For any JSX changes: follow the **UI component library** section in `CLAUDE.md` — use shared components and named Tailwind tokens.
   - For any logic changes: check `specs/business-rules/` to confirm the fix aligns with the spec before writing it.

5. **Run tests:**
   - `npm test` — if any test fails, diagnose and fix before continuing.
   - If the bug is in UI/visual behaviour, also run the relevant E2E tag: `npx bddgen && npx playwright test --grep @<domain>`.
   - If no test covers the bug, add a regression test (unit or E2E, whichever fits) before continuing.

6. **Verify visually** using `/verify` — start the app and confirm the fix works in the browser. Check the specific screen(s) mentioned in the issue. Also spot-check adjacent screens for regressions.

7. **Commit** — stage only the files changed by the fix and commit with a message in the format:
   ```
   fix: <short description matching issue title> (closes #<issue-number>)
   ```
   Check `AI_SDLC_PLAN.md`, `CLAUDE.md`, and `README.md` per the pre-commit rules in `CLAUDE.md` — update them if the fix changes anything documented there.

8. **Comment on the issue** using `gh issue comment $ARGUMENTS --repo rzachs/driftlog`. The comment must include:
   - **Root cause:** one sentence
   - **Fix:** what changed and in which file(s) + line numbers
   - **Commit:** the SHA of the commit just created
   - **Tested:** what tests pass and what was verified visually
   - **To validate:** specific step(s) the human should take to confirm the fix (e.g. "Open the Create Trip modal and confirm the blue button fills the full footer height")

9. **Apply the `fix-ready` label** using `gh issue edit $ARGUMENTS --repo rzachs/driftlog --add-label fix-ready`. If the label does not exist yet, create it first: `gh label create fix-ready --color 0075ca --description "Fix implemented — awaiting human validation" --repo rzachs/driftlog`.

10. Tell the user: "Issue #$ARGUMENTS is labelled `fix-ready`. Validate the fix in the app, then close the issue if it looks good — or reopen with a comment if not."

## Rules

- Never close the issue — that is the human's job after validation.
- Never change behaviour not described in the issue. Bug fixes are minimal and targeted.
- If the root cause turns out to be different from what the issue describes, update the issue comment to explain the discrepancy — do not silently fix a different thing.
- If the fix requires a spec change (the bug is actually correct per the spec, and the spec is wrong), stop and surface this to the human. Do not change specs autonomously.
- Always add or update a test. A fix with no test coverage is incomplete.
- Do not skip `/verify` — visual bugs must be confirmed visually, not just by passing tests.
