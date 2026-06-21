Draft or update a feature spec from a plain-English description. Detects new vs existing, writes the spec file only after user approval, then tells you to run /sdlc-plan.

**Usage:** `/sdlc-spec <plain English description of the feature>`
Example: `/sdlc-spec Add the ability to delete an expense from a trip`

## Steps

1. Read all existing spec files under `specs/features/` recursively. Build a list of what's already there (path + first user story line).

2. Read `$ARGUMENTS` (the user's description).

3. **New vs existing check**: Compare the description against the existing spec files. If any file looks like a match (same capability, same user-facing action), show the user that file's path and user story line, and ask: "Is this an update to this existing spec, or a new feature?" Wait for the answer before continuing. If no match is found, proceed as new.

4. **If new feature**:
   - Determine which epic subfolder it belongs in (`trips/`, `expenses/`, `balances/`, `settle-up/`) based on the description. If ambiguous, ask.
   - Derive a kebab-case filename from the description.
   - Read all files in `specs/business-rules/` to identify which are relevant to this feature.
   - Draft a spec file using this template:
     ```
     # Feature: [name]

     ## User story
     As a [role], I want [capability], so that [outcome].

     ## Acceptance criteria
     - Given [state], when [action], then [result]

     ## Business rules referenced
     - specs/business-rules/[file].md

     ## Out of scope

     ## Edge cases
     (reference the business-rules table, don't restate numbers here)
     ```
   - Populate the user story from the description. Draft AC stubs (Given/When/Then) from what the description implies — one bullet per distinct outcome. Mark anything uncertain with `[?]`.

5. **If update to existing**:
   - Read the current spec file in full.
   - Draft the updated version. Show clearly what's changing and why before presenting the full updated content.

6. Present the draft to the user. Ask: "Does this spec look right? Reply **yes** to write it, or tell me what to change."

7. **Only after explicit approval**: Write the file to `specs/features/<epic>/<filename>.md`.

8. Tell the user: "Spec saved at `specs/features/<epic>/<filename>.md`. Run `/sdlc-plan specs/features/<epic>/<filename>.md` to generate the implementation plan."

## Rules
- Never write to `specs/features/` without explicit user approval in step 6.
- AC stubs must be derived from the description and business rules — never invent behavior not implied by both.
- If the description covers a case that has no corresponding business-rules row, flag it with `[spec gap — needs a business-rules row before implementation]`.
- Out of scope and Edge cases sections may be left as stubs for the human to fill in.
- One file per user story. If the description spans multiple distinct user stories, split into multiple files and ask the user to confirm the split before writing.
