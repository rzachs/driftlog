# Feature: View expense history

## User story

As a trip member, I want to see the full expense list on a trip so I can review what was spent.

## Acceptance criteria

- Given I am on the trip overview and expenses exist, when the page loads, then expenses are listed in reverse chronological order (by date descending, then by created time descending)
- Given an expense in the list, when I view it, then it shows the description, date, who paid, how many ways it was split, and the total amount
- Given there are no expenses on a trip, when I view the expense list section, then I see "No expenses yet."
- Given expenses exist, when I view the summary above the list, then it shows the total number of expenses and the sum of all amounts

## Business rules referenced

None — expense history is display only; balance effects are covered in `specs/business-rules/balance-calculation.md`.

## Out of scope

## Edge cases

- (reference the business-rules table, don't restate numbers here)
