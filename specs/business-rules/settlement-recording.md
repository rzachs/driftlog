# Settlement recording

| Scenario | Input | Expected output |
|---|---|---|
| Recording a new payment creates a settlement record | POST /api/trips/:id/settle with from, to, amount | Record created with recorded_at = now; 201 response |
| Duplicate recording re-activates the existing record | POST with same from/to/amount (within €0.005) as an existing record | recorded_at updated to now; existing record reused; no duplicate created |
| Undo marks the record inactive but keeps it | DELETE /api/trips/:tripId/settle/:recordId | recorded_at set to NULL; record remains in DB |
| Only active settlements affect balances | Settlement with recorded_at = NULL | Excluded from balance calculation |
| Recorded settlement immediately offsets both parties' balances | Payment recorded: Bob → Alice €50 | Bob balance +€50; Alice balance −€50 (see balance-calculation.md row 10) |
| "All settled" state requires at least one payment and all are recorded | 3 payments, all recorded | "All settled up" banner shown |
| Zero payments means nothing to settle | Trip with all-zero balances | "All balances are already zero" message; no payments listed |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

- **Balance update timing** — Each individual recorded payment immediately affects balance calculations. The UI footer currently reads "Balances update once all suggested payments are recorded" — this is inaccurate. Whether to fix the copy or change the behavior (batch updates) has not been decided.
- **Recording a payment not in the suggested list** — The API accepts any from/to/amount combination, not just suggested payments. Whether arbitrary payments should be allowed or restricted to suggested ones has not been decided.
- **Amount tolerance on upsert** — The duplicate check uses a €0.005 tolerance (`ABS(amount - ?) < 0.005`). If two distinct payments between the same people happen to be within €0.005 of each other, the second re-activates the first instead of creating a new record. Whether this tolerance is correct has not been decided.
