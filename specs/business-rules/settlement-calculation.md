# Settlement calculation

| Scenario | Input | Expected output |
|---|---|---|
| Simple 2-person trip | Alice paid $100, Bob's share $50 | Bob pays Alice $50 |
| Near-zero balances are ignored | Balance of $0.004 or −$0.004 | Treated as settled, no payment generated |
| Greedy match: largest creditor meets largest debtor first | Multiple creditors and debtors | Fewest possible payments |
| Partial settlement: debtor owes less than creditor is owed | Creditor owed $80, debtor owes $30 | One payment of $30; creditor still owed $50 |
| Partial settlement: creditor is owed less than debtor owes | Creditor owed $30, debtor owes $80 | One payment of $30; debtor still owes $50 |
| Payment amounts rounded to 2 decimal places | Calculated payment $33.3333 | Payment = $33.33 |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

These cases are not handled by the current code and have no decided behavior. A spec row must be added here before any implementation or test is written for them.

- **Rounding residuals** — When split amounts are rounded individually, the sum of splits may not exactly equal the expense total. The effect on settlement amounts across a full trip has not been decided.
- **Already-recorded settlements** — The settlement calculation does not account for payments that have already been recorded. It always returns the full theoretical settlement, not the remaining balance after partial payments.
