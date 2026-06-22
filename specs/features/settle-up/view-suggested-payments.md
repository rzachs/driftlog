# Feature: View suggested payments

## User story

As a user, I want to see the minimum set of payments that zero out all balances so settling is as simple as possible.

## Acceptance criteria

- Given I am on the trip overview, when I click "Settle up", then I am taken to the settle up page
- Given I am on the settle up page, when payments are calculated, then the list shows the fewest payments needed to zero all balances
- Given the settle up page loads, when I view the header, then it states how many payments were found and how many members are in the trip
- Given all balances are already at or within €0.005 of zero, when I view the settle up page, then I see "All balances are already zero — nothing to settle!" and no payment rows

## Business rules referenced

- `specs/business-rules/settlement-calculation.md` — fewest possible payments via greedy match (row 3); near-zero balances ignored (row 2); simple 2-person case (row 1)
- `specs/business-rules/settlement-recording.md` — zero payments when all balances already zero (row 7)

## Out of scope

## Edge cases

- (reference the business-rules table, don't restate numbers here)
