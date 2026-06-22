# Feature: Create a trip

## User story

As a user, I want to create a trip with a name, dates, and initial members so I can start tracking shared expenses.

## Acceptance criteria

- Given I am on the trips page, when I click "Create trip", then a modal opens with fields for trip name, start date, end date, and people
- Given the modal is open, when I enter a trip name and click "Create trip", then the trip is created and I am navigated to that trip's overview
- Given the modal is open, when I submit without entering a trip name, then the trip is not created
- Given the modal is open, when I type a person's name and press Enter, then they are added to the people list
- Given the modal is open, when I remove a person (other than "You"), then they are excluded from the created trip
- Given the modal is open, when I click Cancel or click the backdrop, then the modal closes and no trip is created
- Given a trip is created, then "You" is always included as a member regardless of the people list

## Business rules referenced

- `specs/business-rules/trips.md` — trip name required (row 1); name trimmed before saving (row 2); start/end dates optional (row 3); "You" always added as first member (row 4); "You" cannot be removed from participant list (row 5)

## Out of scope

## Edge cases

- "You" cannot be removed from the people list
- Start date and end date are optional
