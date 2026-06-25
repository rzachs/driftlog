---
description: Fix a GitHub issue by ID — creates a fix branch, investigates root cause, fixes code, runs tests, verifies visually, commits, opens a PR, comments on the issue, and labels it fix-ready for human validation.
disable-model-invocation: true
---

**Usage:** `/sdlc-fix-bug <issue-number>`
Example: `/sdlc-fix-bug 1`

## Steps

1. **Read the issue** using `gh issue view $ARGUMENTS --repo rzachs/driftlog`. Extract: title, body, any comments. If the issue is already labelled `fix-ready` or is closed, stop and tell the user. Then assign it to the authenticated user: `gh issue edit $ARGUMENTS --repo rzachs/driftlog --add-assignee @me`.

2. **Create a fix branch** — derive a slug from the issue title (kebab-case, max 5 words). Run `git checkout -b fix/<issue-number>-<slug>` (e.g. `fix/7-trip-total-off-by-one`). Tell the user which branch was created.

3. **Identify affected files** from the issue body. If the body names specific files and line numbers, start there. Otherwise grep the codebase to locate the relevant code.

4. **Diagnose the root cause** — read the affected files in full. State the root cause in one sentence before writing any fix. If the issue body already contains a root cause analysis, verify it against the current code before proceeding (the code may have changed since the issue was filed).

5. **Fix the code** — make the minimal change that resolves the bug. Do not refactor unrelated code, change behaviour not described in the issue, or add features. Follow the existing patterns in each file:
   - For any JSX changes: follow the **UI component library** section in `CLAUDE.md` — use shared components and named Tailwind tokens.
   - For any logic changes: check `specs/business-rules/` to confirm the fix aligns with the spec before writing it.

6. **Run tests:**
   - `npm test` — if any test fails, diagnose and fix before continuing.
   - If the bug is in UI/visual behaviour, also run the relevant E2E tag: `npx bddgen && npx playwright test --grep @<domain>`.
   - If no test covers the bug, add a regression test (unit or E2E, whichever fits) before continuing.

7. **Verify visually** using `/verify` — start the app and confirm the fix works in the browser. Check the specific screen(s) mentioned in the issue. Also spot-check adjacent screens for regressions.

8. **Commit** — stage only the files changed by the fix and commit with a message in the format:
   ```
   fix: <short description matching issue title> (closes #<issue-number>)
   ```
   Check `AI_SDLC_PLAN.md`, `CLAUDE.md`, and `README.md` per the pre-commit rules in `CLAUDE.md` — update them if the fix changes anything documented there.

9. **Open a PR** — push the branch and create a PR against `master`:
   ```
   gh pr create --title "fix: <issue title>" --body "Closes #<issue-number>\n\n## Root cause\n<one sentence>\n\n## Fix\n<what changed and where>\n\n## Tested\n<tests passing + visual verification>"
   ```
   The `Closes #<issue-number>` line links the PR to the issue so merging the PR auto-closes it.

10. **Comment on the issue** using `gh issue comment $ARGUMENTS --repo rzachs/driftlog`. The comment must include:
    - **Root cause:** one sentence
    - **Fix:** what changed and in which file(s) + line numbers
    - **PR:** link to the pull request just opened
    - **Tested:** what tests pass and what was verified visually
    - **To validate:** specific step(s) the human should take to confirm the fix (e.g. "Open the Create Trip modal and confirm the blue button fills the full footer height")

11. **Apply the `fix-ready` label** using `gh issue edit $ARGUMENTS --repo rzachs/driftlog --add-label fix-ready`. If the label does not exist yet, create it first: `gh label create fix-ready --color 0075ca --description "Fix implemented — awaiting human validation" --repo rzachs/driftlog`.

12. Tell the user: "Issue #$ARGUMENTS is labelled `fix-ready` and PR is open. Review the PR (the GitHub Action will post an AI review shortly), then merge to close the issue — or push additional commits to the branch if changes are needed."

## Rules

- Never close the issue or merge the PR — those are the human's job after validation.
- Never change behaviour not described in the issue. Bug fixes are minimal and targeted.
- If the root cause turns out to be different from what the issue describes, update the issue comment to explain the discrepancy — do not silently fix a different thing.
- If the fix requires a spec change (the bug is actually correct per the spec, and the spec is wrong), stop and surface this to the human. Do not change specs autonomously.
- Always add or update a test. A fix with no test coverage is incomplete.
- Do not skip `/verify` — visual bugs must be confirmed visually, not just by passing tests.
