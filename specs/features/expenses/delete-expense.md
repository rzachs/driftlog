# Feature: Delete an expense

## User story

As a trip member, I want to delete an expense from a trip, so that mistakes or duplicate entries can be removed and the group's balances stay accurate.

## Acceptance criteria

- Given I am on the trip overview with expenses listed, when I click the delete control on an expense row, then a confirmation prompt appears
- Given the confirmation prompt is open, when I confirm deletion, then the expense is permanently removed and no longer appears in the expense list
- Given the confirmation prompt is open, when I cancel, then the expense is not deleted and nothing changes
- Given I confirm deletion, then the trip's expense count and total amount update to exclude the deleted expense
- Given I confirm deletion, then all trip member balances recalculate as if the expense never existed

## Business rules

| Scenario | Input | Expected output |
|---|---|---|
| Expense and splits are deleted | DELETE /api/trips/:tripId/expenses/:expenseId | Expense row and all associated split rows removed from DB; HTTP 200 |
| Expense not found | DELETE with expenseId that does not exist in this trip | 404 response |
| Confirmation required | User clicks the delete control on an expense | A confirmation dialog appears before any deletion occurs |
| Cancel has no effect | User dismisses confirmation without confirming | Expense unchanged; no API call made |
| Expense list updates immediately | Expense deleted | Deleted expense no longer appears in the list; count and total amount reflect the removal |
| Balances recalculate | Expense deleted | Member balances are derived from remaining expenses + settlements, as if the deleted expense never existed |
| Existing settlements are not reversed | Trip has recorded settlements at the time of expense deletion | Settlements remain unchanged; their amounts may not align with post-deletion balances — this is expected and accepted |

## Business rules referenced

- `specs/business-rules/balance-calculation.md` — balances derive from all expenses + settlements (rows 1–10); deletion simply removes the expense from that derivation

## Out of scope

- Editing an expense (changing amount, description, payer, or splits)
- Bulk delete of multiple expenses at once
- Deleting a payment/settlement (covered by undo-payment feature)
- Restricting deletion to specific roles (e.g. only the payer or trip creator can delete)
