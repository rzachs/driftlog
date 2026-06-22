---
description: Propose business-rules table rows from a feature spec for human review and approval. One row per distinct scenario implied by the spec. Writes only after explicit approval.
---

**Usage:** `/sdlc-rules <spec-path>`
Example: `/sdlc-rules specs/features/trips/delete-trip.md`

## Steps

1. Read the feature spec at `$ARGUMENTS`. If it doesn't exist, stop and tell the user.

2. Parse the **Business rules referenced** section to identify which `specs/business-rules/*.md` file(s) to update.

3. Read each referenced business-rules file. Note:
   - All existing table rows (to avoid proposing duplicates)
   - The **Known gaps** section — identify any entry that matches this feature

4. Analyze the feature spec (user story + acceptance criteria) to identify what scenarios need business-rules rows. For each AC item ask: "What must the system decide to fulfill this?" Map each distinct decision to a row candidate:
   - The happy path (successful operation)
   - Validation or error cases implied by the AC
   - Any state left behind after the action (side effects, cascade behavior, navigation)

5. Draft proposed rows in the same table format as the existing file (`| Scenario | Input | Expected output |`). Mark any row you are uncertain about with `[?]`. Do not propose rows for cases already covered in the existing table.

6. Present the proposed rows to the user grouped by target file. Show them as a markdown table. Explain the AC item each row is derived from.

7. Ask: "Do these rows look right? Reply **yes** to add them, remove any you don't want, or tell me what to change."

8. **Only after explicit approval**: Append the approved rows to the appropriate business-rules file(s). If a **Known gaps** entry for this feature exists, remove it.

9. Tell the user: "Business rules updated. Next: update the design comps in Claude Design, then run `/sdlc-plan $ARGUMENTS` to generate the implementation plan."

## Rules

- Never write to `specs/business-rules/` without explicit user approval in step 7.
- Every proposed row must be traceable to a specific AC item in the feature spec — never invent scenarios not implied by the spec.
- Do not re-propose rows already in the existing table.
- If an AC item implies a decision that the spec does not resolve (e.g. "what happens to related data"), propose a row with `[?]` and flag it for the human to fill in the expected output.
- Format rows to match the existing file exactly — same column order, same style.
- One row per distinct scenario. Do not bundle multiple outcomes into one row.
