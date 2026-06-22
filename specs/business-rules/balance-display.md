# Balance display

| Scenario | Input | Expected output |
|---|---|---|
| Settled threshold on trip list | abs(myBalance) < 0.005 | Shows "Settled" / "All cleared" |
| "You're owed" label on trip list | myBalance > 0 (and not settled) | Label: "You're owed", amount in green |
| "You owe" label on trip list | myBalance ≤ 0 (and not settled) | Label: "You owe", amount in black |
| "You" not found in trip balances | No member named "You" on the trip | myBalance defaults to 0 (shown as "Settled") |
| "You are owed" on trip overview | Logged-in user balance > 0 | Label: "You are owed" |
| "Is owed" on trip overview | Any other member balance > 0 | Label: "Is owed" |
| "Owes the group" on trip overview | Any member balance ≤ 0 | Label: "Owes the group" |
| Expense list ordered by date descending, then created_at descending | Multiple expenses on same date | Most recently created shown first within the same date |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

- **Zero-balance member accent on trip overview** — A member with exactly €0.00 balance receives the same red/dark accent as a negative-balance member (`balance > 0` is the only green condition). Whether zero should be green, neutral, or red has not been decided.
- **"You owe" threshold on trip list** — "You owe" triggers at myBalance ≤ 0, but the settled threshold is abs(balance) < 0.005. A balance of −€0.003 would show "You owe" rather than "Settled". Whether the settled threshold should apply symmetrically here has not been decided.
