---
description: Generate a Gherkin .feature file from a feature spec's Given/When/Then acceptance criteria. One Scenario per AC item, @wip tag on spec-gap scenarios. Output goes to e2e/features/<domain>/<feature>.feature.
disable-model-invocation: true
---

**Usage:** `/sdlc-generate-e2e <path to feature spec file>`
Example: `/sdlc-generate-e2e specs/features/trips/create-trip.md`

## Steps

1. Read the spec file at `$ARGUMENTS`. If it doesn't exist, list available files under `specs/features/` and stop.

2. Extract the feature name from the `# Feature:` or first `#` heading.

3. Parse the `## Acceptance criteria` section. Each bullet is a Given/When/Then item:
   - The text before "when" is the Given state
   - The text between "when" and "then" is the When action
   - The text after "then" is the Then assertion

4. Read the `## Edge cases` or `## Known gaps` section. Identify any items marked `[spec gap]` — these must be tagged `@wip` in the generated file.

5. Check the `## Business rules referenced` section. If a business-rules file is referenced, read it to identify any **Known gaps**. Any AC item that exercises a known-gap case should also be tagged `@wip`.

6. Determine the output path:
   - Input: `specs/features/<domain>/<feature>.md`
   - Output: `e2e/features/<domain>/<feature>.feature`

7. Generate the `.feature` file:

   ```gherkin
   Feature: <Feature name>

     Background:
       Given <shared pre-condition if 3+ scenarios share one>

     Scenario: <Short imperative title>
       Given <state>
       When <action>
       Then <assertion>

     @wip
     Scenario: <Spec-gap scenario title>
       Given <state>
       When <action>
       Then <assertion>
   ```

   - Scenario title: 3–6 word imperative phrase derived from the AC. Do NOT use the raw Given/When/Then text as the title.
   - Background: extract only if 3+ scenarios share the identical Given.
   - `@wip` tag goes on the line immediately before `Scenario:`.

8. Present the generated content to the user. Ask: "Does this look right? Reply **yes** to write it, or tell me what to adjust."

9. After explicit approval, write the file to the path from step 6.

## Rules

- Output is Gherkin (`.feature`), not Markdown.
- Do NOT generate step definition code — step defs live in `e2e/steps/` and are maintained separately.
- Do NOT invent AC items. One Scenario per AC bullet, one-to-one.
- Tag `@wip` on spec-gap scenarios only. Use `@wip`, never `@skip`.
- Never write to `e2e/features/` without explicit user approval in step 8.
- If the spec has no AC section or only one item, output a minimal feature file and note the sparse spec.
