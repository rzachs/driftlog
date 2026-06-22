# Trip management

| Scenario | Input | Expected output |
|---|---|---|
| Trip name is required | POST /api/trips with no name | 400 error: "name required" |
| Trip name is trimmed before saving | Name "  Lisbon  " | Stored as "Lisbon" |
| Start date and end date are optional | POST with no startDate or endDate | Trip created with null dates |
| "You" is always added as the first member | POST with people: ["Alice", "Bob"] | Members stored: ["You", "Alice", "Bob"] |
| "You" cannot be removed from the participant list | User clicks remove on "You" chip | No remove button shown for "You" |
| Trips are listed most-recently-created first | Three trips created at different times | Displayed in reverse creation order |
| A trip is active if start_date ≤ today AND (no end_date OR end_date ≥ today) | start 2026-06-01, end 2026-06-30, today 2026-06-15 | Shown with "Active" badge |
| A trip with no dates is not active | null start_date and end_date | No "Active" badge |
| A trip whose start_date is in the future is not active | start 2026-12-01, today 2026-06-22 | No "Active" badge |
| Rename: empty or whitespace-only result reverts to prior name | User clears title and blurs | Name unchanged |
| Rename: name is trimmed before saving | " New name " | Stored as "New name" |
| Rename: Enter commits the edit | User types new name, presses Enter | Name saved |
| Rename: Escape reverts without saving | User types new name, presses Escape | Name unchanged |
| Rename a non-existent trip | PATCH /api/trips/:id, id not found | 404 error: "Not found" |
| Deleting a trip permanently removes it and all related data | DELETE /api/trips/:id | Trip, its expenses, its members, and its settlements are deleted; 200 OK |
| Deleting a non-existent trip | DELETE /api/trips/:id, id not found | 404 error: "Not found" |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

- **End date before start date** — No validation prevents end_date earlier than start_date. Whether this is blocked or silently allowed is undecided.
- **Duplicate member names** — No uniqueness constraint prevents two members named "Alice" on the same trip. Behavior is undefined.
- **"You" case-sensitivity** — The server filters `people.filter(p => p !== 'You')` (exact match). Sending "you" lowercase creates a second member alongside "You". Case-handling for member names has not been decided.
