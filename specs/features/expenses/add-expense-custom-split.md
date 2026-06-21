# Feature: Add an expense with custom split

## User story

As a user, I want to log an expense with custom per-person amounts so unequal splits are captured accurately.

## Acceptance criteria

- Given I am on the add expense form, when I select "Custom amounts", then each included member shows an editable amount field instead of an equal share
- Given I am in custom split mode, when the entered amounts sum to the expense total, then the form shows "Fully allocated" in green
- Given I am in custom split mode, when the entered amounts sum to less than the expense total, then the form shows the unallocated remainder in red
- Given I am in custom split mode, when the entered amounts sum to more than the expense total, then the form shows the over-allocated amount in red
- Given I am in custom split mode, when I deselect a member, then their amount field is disabled and their amount is excluded from the sum
- Given I submit an expense with custom amounts, when the trip overview loads, then each member's balance is adjusted by their specific entered amount

## Business rules referenced

- `specs/business-rules/balance-calculation.md` — each participant's balance decreases by their split amount (row 2); payer nets out (row 3)

## Out of scope

## Edge cases

- [spec gap — needs a business-rules row before implementation] Splits that don't sum to the expense total — no decided behavior (see Known gaps in `balance-calculation.md`)
