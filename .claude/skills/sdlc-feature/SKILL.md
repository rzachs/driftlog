---
description: Draft a combined feature artifact (user story + acceptance criteria + business rules) from a plain-English description. One draft, one approval gate — replaces the old /sdlc-spec + /sdlc-rules pair.
disable-model-invocation: true
---

**Usage:** `/sdlc-feature <plain-English description>`
Example: `/sdlc-feature delete a trip`

## Steps

1. Read all existing spec files under `specs/features/` recursively. Build a list of what's already there (path + user story line).

2. **New vs existing check:** Compare the description to existing files. If a match is found, show the user the path and user story, and ask: "Is this an update to this existing spec, or a new feature?" Wait for the answer. If no match, proceed as new.

3. **Draft the combined artifact.** For a new feature, determine the correct epic folder (`trips/`, `expenses/`, `balances/`, `settle-up/` — or a new folder if none fits) and a kebab-case filename. Then draft a single file containing all four sections:

   **User story** — one sentence: "As a [role], I want [capability], so that [outcome]."

   **Acceptance criteria** — Given/When/Then bullets covering: the happy path, the cancel/undo path, and any error state the user sees. One bullet per distinct outcome.

   **Business rules** — decide which form to use before drafting:

   - **Shared rules (reference form):** If the rules this feature depends on are already defined in `specs/business-rules/` AND those rules apply to other features too, reference the external file and cite the specific rows. Example: `specs/business-rules/balance-calculation.md` — rows 3, 7, 10. Do not embed a duplicate table.
   - **Feature-unique rules (embedded form):** If the rules are specific to this feature and no other feature will share them, embed a decision table directly in the feature file (`| Scenario | Input | Expected output |`). This table covers every *consequence* implied by the AC:
     - What data is created, modified, or deleted?
     - What validation rules apply and what errors are returned?
     - What cascade effects occur (e.g. deleting a parent record)?
     - What navigation or state change follows?
     - What error is returned for invalid or not-found inputs?
   - Mark any row where the correct behavior is genuinely unclear with `[?]` — these are known gaps.
   - A feature may use **both forms** if some rules are shared and others are unique.

   **Out of scope** — explicit list of related cases that are NOT in this feature.

   > The business rules section is the load-bearing part of this artifact. AC items describe the user experience; business rules describe the system behavior. Approving this file means approving the consequences, not just the existence of a button. Make those consequences explicit.

4. Present the full draft to the user. Say: "Here is the combined spec + business rules for **[feature name]**. The business rules table is the critical part — review it carefully before approving, as it defines what the system will actually do. Reply **yes** to write the file, or tell me what to change."

5. **Only after explicit approval:** Write the file to `specs/features/<epic>/<filename>.md`.

6. Tell the user: "File written at `specs/features/<epic>/<filename>.md`. Next steps:
   - If this feature touches the UI: author or update the design in Claude Design, then run `/sdlc-sync-app-design`.
   - Run `/sdlc-plan specs/features/<epic>/<filename>.md` when ready to plan implementation."

## For updates to existing specs

- Read the current file in full.
- Draft the updated version. Show clearly what is changing and why.
- The same one-approval rule applies: present the full updated file, write only after explicit approval.
- If business rules rows are being removed or changed, call that out explicitly — removed rows mean behavior the system will no longer enforce.

## Rules

- Never write to `specs/features/` without explicit user approval.
- Business rules must be traceable to a specific AC item — never add rows for cases not implied by the spec.
- If an AC item implies a consequence the description does not resolve (e.g. "what happens to related data on delete"), draft a row with `[?]` in the Expected output and flag it explicitly for the human.
- If the description is too vague to infer consequences, ask one clarifying question before drafting. Do not write a spec with empty or placeholder business rules rows.
- One file per user story. If the description spans multiple distinct user stories, propose the split and ask the human to confirm before writing anything.
