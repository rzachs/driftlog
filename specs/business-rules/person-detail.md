# Person detail breakdown

| Scenario | Input | Expected output |
|---|---|---|
| Only expenses where the person has a split row are shown | Member has no split on an expense | That expense is excluded from the breakdown |
| Net per expense (payer): amount paid minus their split share | Member paid €120, their share €30 | Net = +€90 |
| Net per expense (non-payer): negative of their split share | Member did not pay, share €30 | Net = −€30 |
| Total paid = sum of full expense amounts where member is payer | Member paid two expenses: €120 and €80 | Total paid = €200 |
| Total share = sum of all split amounts for the member | Member has shares of €30, €20, €15 | Total share = €65 |
| Net balance = total paid − total share, rounded to 2 dp | totalPaid €200, totalShare €65 | Net balance = +€135.00 |
| "Settle up" CTA shown only when net balance is negative | Net balance = −€40 | CTA visible |
| "Settle up" CTA hidden when net balance is zero or positive | Net balance = €0 or +€80 | CTA not shown |

> Examples in this table ARE the spec. If a case isn't listed here, it hasn't been decided — don't infer or guess it.

## Known gaps

- **Settlements not reflected in person detail** — The person detail `netBalance` is calculated from raw paid/share totals and does not account for recorded settlements. A member who has settled up will still show a non-zero net balance on this screen. Whether settlements should offset the person detail view has not been decided.
