# Feature: Add an expense with even split

## User story

As a user, I want to log an expense split evenly among selected members so balances update automatically without manual math.

## Acceptance criteria

- Given I am on the trip overview, when I click "Add expense", then I am taken to the add expense form
- Given I am on the add expense form with "Split evenly" selected, when I fill in amount, description, payer, and date and click "Add expense", then the expense is recorded and I am returned to the trip overview
- Given I am on the add expense form, when I deselect some members, then the total is divided equally only among the selected members
- Given I am on the add expense form with "Split evenly" selected, when I view the people list, then each included member shows their equal share amount
- Given I submit an expense, when the trip overview loads, then the new expense appears in the expense list and each member's balance reflects the split
- Given I am on the add expense form, when I submit without a required field (amount, description, payer, or date), then the expense is not submitted
- Given I click "Cancel", when I am returned to the trip overview, then no expense is created

## Business rules referenced

- `specs/business-rules/balance-calculation.md` — payer's balance increases by full amount (row 1); each participant's balance decreases by their share (row 2); payer who is also a participant nets out (row 3)

## Out of scope

## Edge cases

- [spec gap] What happens if no members are selected for the split — no decided behavior
