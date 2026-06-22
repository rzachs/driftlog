# Feature: Rename a trip

## User story

As a user, I want to rename a trip so I can correct it after creation.

## Acceptance criteria

- Given I am on the trip overview, when I click the trip name, then it becomes editable inline
- Given I am editing the trip name, when I type a new name and press Enter or click away, then the trip is renamed and the new name is saved
- Given I am editing the trip name, when I press Escape, then the name reverts to the original without saving
- Given I am editing the trip name, when I clear the name entirely and click away, then the name reverts to the original (empty name is not saved)
- Given the trip is renamed, when I view the browser tab, then the page title updates to reflect the new name

## Business rules referenced

- `specs/business-rules/trips.md` — rename: empty/whitespace reverts to prior name (row 10); name trimmed before saving (row 11); Enter commits the edit (row 12); Escape reverts without saving (row 13)

## Out of scope

## Edge cases

- Leading/trailing whitespace is trimmed before saving
