# Feature: Undo a recorded payment

## User story

As a user, I want to undo a recorded payment so I can correct mistakes.

## Acceptance criteria

- Given a payment is recorded, when I click "Undo", then the payment returns to the unrecorded state and the "Record payment" button reappears
- Given I undo a payment, when I view the settle up page, then the recorded count in the subtitle decreases by one
- Given all payments were recorded and I undo one, when I view the settle up page, then the "All settled up" banner disappears

## Business rules referenced

- `specs/business-rules/settlement-recording.md` — undo sets recorded_at to NULL, record is kept not deleted (row 3); only settlements with recorded_at IS NOT NULL count toward balances (row 4)
- `specs/business-rules/balance-calculation.md` — recorded settlement offsets both parties' balances (row 10); undoing removes that offset

## Out of scope

## Edge cases

- (reference the business-rules table, don't restate numbers here)
