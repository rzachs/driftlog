# Feature: View my trips

## User story

As a user, I want to see all my trips with my current balance so I know where I stand across trips at a glance.

## Acceptance criteria

- Given I navigate to the trips page, when trips exist, then they are listed ordered by creation date (newest first)
- Given a trip where my balance is positive, when I view the list, then it shows "You're owed" with the amount
- Given a trip where my balance is negative, when I view the list, then it shows "You owe" with the amount
- Given a trip where my balance is within €0.005 of zero, when I view the list, then it shows "Settled / All cleared"
- Given a trip whose date range includes today, when I view the list, then it shows an "Active" badge
- Given no trips exist, when I navigate to the trips page, then I see "No trips yet — create your first one."
- Given trips exist, when I view the page subtitle, then it shows the total trip count and how many are active

## Business rules referenced

- `specs/business-rules/balance-calculation.md` — positive balance = creditor (rows 7–9)

## Out of scope

## Edge cases

- (reference the business-rules table, don't restate numbers here)
