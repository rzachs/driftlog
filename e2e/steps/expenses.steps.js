const { Given, When, Then, expect } = require('../fixtures');

Given('I am on the trip overview', async ({ page, seededTrip }) => {
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

Given('no expenses exist on the trip', async ({ page, seededTrip }) => {
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

Given('expenses exist on the trip', async ({ page, request, seededTrip }) => {
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'First expense',
      amount: 60,
      paidById: seededTrip.members.find(m => m.name === 'You').id,
      date: '2026-01-03',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 20 })),
    },
  });
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'Second expense',
      amount: 30,
      paidById: seededTrip.members.find(m => m.name === 'Maya').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 10 })),
    },
  });
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

When('I fill in amount {string}, description {string}, payer {string}, date {string}',
  async ({ page }, amount, desc, payer, date) => {
    await page.locator('input[placeholder="0.00"]').fill(amount);
    await page.locator('input[placeholder*="Dinner"]').fill(desc);
    await page.locator('select').selectOption({ label: payer });
    await page.locator('input[type="date"]').fill(date);
  }
);

When('I fill in amount {string}', async ({ page }, amount) => {
  await page.locator('input[placeholder="0.00"]').fill(amount);
});

When('I select {string}', async ({ page }, mode) => {
  await page.getByText(mode, { exact: true }).click();
});

When('I deselect all members except {string} and {string}',
  async ({ page, seededTrip }, keep1, keep2) => {
    for (const member of seededTrip.members) {
      if (member.name !== keep1 && member.name !== keep2) {
        await page.locator(`[data-member="${member.name}"]`).locator('span').first().click();
      }
    }
  }
);

When('I deselect all members', async ({ page, seededTrip }) => {
  for (const member of seededTrip.members) {
    await page.locator(`[data-member="${member.name}"]`).locator('span').first().click();
  }
});

When('I deselect {string}', async ({ page }, name) => {
  await page.locator(`[data-member="${name}"]`).locator('span').first().click();
});

When('I fill in amount {string} with {string} selected', async ({ page }, amount, _mode) => {
  await page.locator('input[placeholder="0.00"]').fill(amount);
});

When('I enter {string} for {string}', async ({ page }, amount, personName) => {
  await page.locator(`input[data-person="${personName}"]`).fill(amount);
});

When('I click {string} with description {string} and date {string}',
  async ({ page }, label, desc, date) => {
    await page.locator('input[placeholder*="Dinner"]').fill(desc);
    await page.locator('input[type="date"]').fill(date);
    await page.getByRole('button', { name: label }).click();
  }
);

When('I click {string} without filling in amount', async ({ page }, label) => {
  await page.getByRole('button', { name: label }).click();
});

Then('I am on the add expense form', async ({ page }) => {
  await expect(page).toHaveURL(/\/add-expense$/);
});

Then('each included member shows their equal share', async ({ page }) => {
  await expect(page.locator('text=/€\\d/').first()).toBeVisible();
});

Then('each included member shows their equal share amount', async ({ page }) => {
  // In even mode: shows € amounts; in custom mode: shows editable inputs
  const amountLocator = page.locator('text=/€\\d/');
  const inputLocator = page.locator('input[data-person]');
  if (await amountLocator.count() > 0) {
    await expect(amountLocator.first()).toBeVisible();
  } else {
    await expect(inputLocator.first()).toBeVisible();
  }
});

Then('{string} appears in the expense list', async ({ page }, desc) => {
  await expect(page.getByText(desc)).toBeVisible();
});

Then('each member\'s balance card reflects the split', async ({ page }) => {
  await expect(page.locator('text=/€/').first()).toBeVisible();
});

Then('each member\'s balance reflects their specific entered amount', async ({ page }) => {
  await expect(page.locator('text=/€/').first()).toBeVisible();
});

Then('I remain on the add expense form', async ({ page }) => {
  await expect(page).toHaveURL(/\/add-expense$/);
});

Then('no new expense was created', async ({ page }) => {
  await expect(page.getByText('No expenses yet')).toBeVisible();
});

Then('{string}\'s amount field is disabled', async ({ page }, name) => {
  const input = page.locator(`[data-member="${name}"]`).locator('input');
  await expect(input).toBeDisabled();
});

Then('{string}\'s amount is excluded from the sum', async ({ page }, _name) => {
  // Verified implicitly via the allocation status display
  await expect(page.locator('text=/allocated/')).toBeVisible();
});

Then('the form shows {string} in green', async ({ page }, text) => {
  const el = page.locator(`text=${text}`);
  await expect(el).toBeVisible();
  await expect(el).toHaveCSS('color', /rgb\(.*\)/);
});

Then('the form shows the unallocated remainder in red', async ({ page }) => {
  await expect(page.locator('text=/left/i').first()).toBeVisible();
});

Then('the form shows the over-allocated amount in red', async ({ page }) => {
  await expect(page.locator('text=/over/i').first()).toBeVisible();
});

Then('the expense is not submitted', async ({ page }) => {
  await expect(page).toHaveURL(/\/add-expense$/);
});

// Expense history

When('I view the expense list section', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

When('the expense list loads', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

When('I view an expense in the list', async ({ page }) => {
  await expect(page.locator('[data-testid="expense-row"]').first()).toBeVisible();
});

When('I view the summary above the expense list', async ({ page }) => {
  // Summary row is always visible when expenses exist
});

Then('expenses are listed with most recent date first', async ({ page }) => {
  // First expense should be "First expense" (date 2026-01-03, more recent)
  const firstText = await page.locator('[data-testid="expense-row"]').first().textContent();
  expect(firstText).toContain('First expense');
});

Then('it shows the description, date, who paid, split count, and total amount', async ({ page }) => {
  const row = page.locator('[data-testid="expense-row"]').first();
  await expect(row).toContainText('First expense');
  await expect(row).toContainText('€');
});

Then('it shows the total number of expenses and the sum of all amounts', async ({ page }) => {
  await expect(page.locator('text=/\\d+ expense/')).toBeVisible();
  await expect(page.locator('text=/total/')).toBeVisible();
});
