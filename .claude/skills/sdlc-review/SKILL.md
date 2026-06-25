---
description: Review the implementation of a feature for code quality and spec fidelity. Runs the built-in /code-review then adds a spec-traceability pass — every change must cite a spec row, every spec row must have a change.
disable-model-invocation: true
---

**Usage:** `/sdlc-review <path to feature spec file>`
Example: `/sdlc-review specs/features/trips/delete-trip.md`

## Steps

1. Read the spec file at `$ARGUMENTS`. If it doesn't exist, stop.

2. **Run the built-in code review.** Invoke the `code-review` skill at `high` effort. This covers correctness bugs, reuse, simplification, and efficiency. Let it complete and capture its findings.

3. **Spec-fidelity pass.** This is the layer `/code-review` does not do — checking that the implementation matches the *approved intent*, not just internal consistency.

   a. Get the diff for this feature: `git diff main...HEAD` (or against the merge base if on a branch).

   b. Read all referenced business-rules files and/or the embedded business rules table in the spec.

   c. **Traceability check — code → spec:** For each meaningful change in the diff (new function, new route, new UI element, changed logic), identify which AC item or business-rules row it satisfies. Flag any change that cannot be traced to a spec row — this is invented behavior.

   d. **Traceability check — spec → code:** For each AC item and business-rules row, confirm there is a corresponding code change and a corresponding test. Flag any row with no implementation and any row with no test.

   e. **Test citation check:** In unit test files, each `it()` description should include `[AC: ...]` or `[row N]`. In E2E files, each Scenario title should trace to an AC item. Flag tests that lack a spec citation.

4. **Produce a combined report** with two sections:

   ### Code review findings
   Findings from step 2 (the built-in `/code-review`), reproduced or summarised here.

   ### Spec-fidelity findings
   Structured as three subsections:
   - **Untraceable code** — changes with no spec row (invented behavior)
   - **Unimplemented spec rows** — rows with no corresponding code change
   - **Uncited tests** — tests with no `[row N]` or `[AC: ...]` citation

   If all three subsections are empty, say: "All changes trace to spec rows. All spec rows are implemented and tested."

5. If any **untraceable code** is found, flag it as a blocker: "This behavior has no spec row. It must either be removed or a spec row must be added and approved before this feature ships."

6. If any **unimplemented spec rows** are found, flag them as blockers: "These rows are in the approved spec but have no implementation. The feature is incomplete."

7. Ask the user: "Do you want me to fix any of the code-review findings, or proceed to Step 9 (human verify)?"

## Rules

- Never modify spec files — a gap is a gap to surface, not to fill.
- Untraceable code is not automatically wrong — it may be scaffolding, refactoring, or shared utility. Use judgment. But if it implements business behavior, it needs a spec row.
- Do not block on style-only findings from `/code-review`. Only correctness bugs and spec-fidelity issues are blockers.
- If the diff is empty or the feature appears not yet implemented, stop and tell the user: "No changes found on this branch relative to main. Run `/sdlc-implement $ARGUMENTS` first."
