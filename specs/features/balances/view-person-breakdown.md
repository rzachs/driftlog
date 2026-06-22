# Feature: View person breakdown

## User story

As a trip member, I want to see a specific person's per-expense breakdown so I understand how their balance was calculated.

## Acceptance criteria

- Given I click a member's balance card on the trip overview, when the person detail page loads, then I see their total paid, total share of expenses, and net balance
- Given a member paid for an expense, when I view their breakdown row for that expense, then the net impact is positive (amount paid minus their share)
- Given a member did not pay for an expense but was included in the split, when I view their breakdown row, then the net impact is negative (their share amount)
- Given a member paid for an expense they were also split into, when I view their breakdown row, then the net impact reflects the balance-calculation payer-nets-out rule
- Given a member has a negative net balance, when I view their detail page, then a "Settle up" call-to-action is shown linking to the settle up page
- Given a member has a positive net balance, when I view their detail page, then no settle up CTA is shown

## Business rules referenced

- `specs/business-rules/person-detail.md` — expenses without a split for this member excluded (row 1); net per expense for payer = paid minus share (row 2); net for non-payer = negative share (row 3); totalPaid (row 4); totalShare (row 5); netBalance rounded to 2 dp (row 6); settle up CTA shown only when netBalance < 0 (row 7); CTA hidden when zero or positive (row 8)
- `specs/business-rules/balance-calculation.md` — payer's balance increases by full amount (row 1); participant's balance decreases by share (row 2); payer who is also a participant nets out (row 3); non-payer participant (row 4)

## Out of scope

## Edge cases

- (reference the business-rules table, don't restate numbers here)
