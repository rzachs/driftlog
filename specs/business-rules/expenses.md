# Expense creation

| Scenario | Input | Expected output |
|---|---|---|
| All fields are required | POST missing any of: description, amount, paidById, date, splits | 400 error: "Missing required fields" |
| Date defaults to today when the form opens | User opens Add Expense with no date set | Date field pre-filled with today's date |
| Payer defaults to the first member of the trip | Trip has members [You, Alice, Bob] | "Paid by" defaults to You |
| All members are pre-selected when the form opens | Trip has 4 members | All 4 checked in split list |
| Even split: each share = total ÷ number of selected members | €120 split among 4 | Each share = €30 (unrounded, sent as-is) |
| Even split: deselecting a member removes them from the split | 4 members, one deselected | Split sent for 3 members only |
| Custom split: remaining = total − sum of entered amounts | Total €100, entered €40 + €35 | Remaining = €25 |
| Custom split: fully allocated when remaining < €0.005 | Remaining €0.004 | Shows "Fully allocated" in green |
| Custom split: shows unallocated amount when remaining > €0.005 | Remaining €5.00 | Shows "€5.00 left" in red |
| Custom split: shows over-allocated amount when remaining < −€0.005 | Remaining −€2.00 | Shows "€2.00 over" in red |
| Unchecked members cannot have a custom amount entered | Member deselected in custom mode | Amount input disabled |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

- **Even split rounding** — The UI sends raw floats (e.g. €33.333333) as split amounts. The seed data in db.js rounds splits to 2 dp before inserting. Which is correct has not been decided. See also `balance-calculation.md` known gaps (splits don't sum to total).
- **Custom split not fully allocated** — The UI warns when custom amounts don't sum to the total but does not block submission. Whether to block or allow has not been decided.
- **Zero-amount expense** — See `balance-calculation.md` known gaps.
- **Split includes a non-member** — See `balance-calculation.md` known gaps.
