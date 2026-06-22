# Feature: Record a payment

## User story

As a user, I want to mark a suggested payment as done so the group knows it's been transferred outside the app.

## Acceptance criteria

- Given a suggested payment is unrecorded, when I click "Record payment", then the row is marked as settled with a checkmark and the button changes to "Undo"
- Given a payment is recorded, when I view the page, then the payment row is visually dimmed
- Given all suggested payments are recorded, when I view the settle up page, then an "All settled up" confirmation banner appears
- Given the page subtitle, when payments are partially recorded, then it shows how many of the total are recorded (e.g. "1 of 3 recorded")

## Business rules referenced

- `specs/business-rules/settlement-recording.md` — recording creates a record with recorded_at = now (row 1); duplicate recording re-activates existing record (row 2); balance updates immediately on each recording (row 5); "all settled" banner when all payments recorded (row 6)
- `specs/business-rules/balance-calculation.md` — recorded settlement offsets both parties' balances (row 10)

## Out of scope

## Edge cases

- (reference the business-rules table, don't restate numbers here)
