# Feature: View trip balances

## User story

As a trip member, I want to see everyone's net balance on the trip overview so I know who owes what at a glance.

## Acceptance criteria

- Given I am on the trip overview, when balances load, then each member is shown as a card with their name and net balance amount
- Given a member has a positive balance, when I view their card, then it has a green accent and shows "Is owed" (or "You are owed" for the logged-in user)
- Given a member has a negative balance, when I view their card, then it has a red accent and shows "Owes the group"
- Given I click a member's balance card, when I am taken to their detail page, then the URL matches `/trips/:id/members/:memberId`

## Business rules referenced

- `specs/business-rules/balance-calculation.md` — positive balance = creditor (row 7); negative balance = debtor (row 8); zero balance = nothing to settle (row 9)

## Out of scope

## Edge cases

- [spec gap] A member with exactly zero balance — the current code renders their card with a red accent and "Owes the group", which appears incorrect. No decided behaviour for this display case.
