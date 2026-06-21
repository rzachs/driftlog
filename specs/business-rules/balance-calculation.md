# Balance calculation

| Scenario | Input | Expected output |
|---|---|---|
| Payer's balance increases by the full expense amount | Expense $120, paid by Alice | Alice balance +$120 |
| Each participant's balance decreases by their split amount | Expense split: Alice $40, Bob $40, Carol $40 | Each balance −$40 |
| Payer who is also a participant nets out | Alice pays $120, split 3 ways $40 each | Alice net: +$80 |
| Non-payer participant | Bob splits $40 on an expense he didn't pay | Bob net: −$40 |
| Member with no expenses at all | Member has no payments, no splits | Balance = $0 |
| Balances are rounded to 2 decimal places | Raw balance $10.336667 | Displayed as $10.34 |
| Positive balance = others owe you | Balance +$80 | Person is a creditor |
| Negative balance = you owe others | Balance −$40 | Person is a debtor |
| Zero balance = nothing to settle | Balance $0.00 | No payment required |
| Recorded settlement offsets both parties' balances | Settlement of $50 recorded: Bob paid Alice | Bob balance +$50; Alice balance −$50 |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

These cases are not handled by the current code and have no decided behavior. A spec row must be added here before any implementation or test is written for them.

- **Splits don't sum to expense total** — The server accepts split amounts that don't add up to the expense total. If Alice pays $100 but splits only total $90, the $10 is unaccounted for and silently affects balances. No validation exists; no behavior has been decided.
- **Split includes a non-member** — The server does not verify that a split `personId` belongs to the trip. Behavior when a non-member appears in a split is undefined.
- **Zero-amount expense** — Nothing blocks an expense with amount $0 from being submitted. Effect on balances is undefined.
