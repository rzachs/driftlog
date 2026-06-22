# Feature: Delete a trip

## User story

As a user, I want to delete a trip I no longer need, so that my trips list stays clean and relevant.

## Acceptance criteria

- Given I am on the trips list, when I click a delete control on a trip, then a confirmation prompt appears
- Given I am on a trip's overview page, when I click delete, then a confirmation prompt appears
- Given the confirmation prompt is open, when I confirm deletion, then the trip and all its expenses, members, and settlements are permanently removed
- Given the confirmation prompt is open, when I cancel, then the trip is not deleted and nothing changes
- Given I confirm deletion from the trips list, then the trip disappears from the list
- Given I confirm deletion from the trip overview, then I am navigated back to the trips list

## Business rules referenced

- `specs/business-rules/trips.md` — Trip deletion (known gap; rows must be added before implementation)

## Out of scope

## Edge cases
