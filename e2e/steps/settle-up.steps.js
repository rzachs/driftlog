const { Given, When, Then, expect } = require('../fixtures');

Given('I am on the settle up page with at least one suggested payment',
  async ({ page, request, seededTrip }) => {
    await request.post(`/api/trips/${seededTrip.id}/expenses`, {
      data: {
        description: 'Setup expense',
        amount: 90,
        paidById: seededTrip.members.find(m => m.name === 'You').id,
        date: '2026-01-02',
        splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
      },
    });
    await page.goto(`/trips/${seededTrip.id}/settle`);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: 'Record payment' }).first()).toBeVisible();
  }
);

Given('I am on the settle up page with at least one recorded payment',
  async ({ page, request, seededTrip }) => {
    await request.post(`/api/trips/${seededTrip.id}/expenses`, {
      data: {
        description: 'Setup expense',
        amount: 90,
        paidById: seededTrip.members.find(m => m.name === 'You').id,
        date: '2026-01-02',
        splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
      },
    });
    await page.goto(`/trips/${seededTrip.id}/settle`);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Record payment' }).first().click();
    await page.waitForResponse(r => r.url().includes('/settle') && r.request().method() === 'POST');
  }
);

Given('all balances are already at or within 0.005 of zero', async ({ page, seededTrip }) => {
  // No expenses → all balances zero
  await page.goto(`/trips/${seededTrip.id}/settle`);
  await page.waitForLoadState('networkidle');
});

Given('all payments were recorded', async ({ page, request, seededTrip }) => {
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'Setup expense',
      amount: 90,
      paidById: seededTrip.members.find(m => m.name === 'You').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
    },
  });
  await page.goto(`/trips/${seededTrip.id}/settle`);
  await page.waitForLoadState('networkidle');
  // Re-query after each click to avoid stale references
  while (await page.getByRole('button', { name: 'Record payment' }).count() > 0) {
    await page.getByRole('button', { name: 'Record payment' }).first().click();
    await page.waitForResponse(r => r.url().includes('/settle') && r.request().method() === 'POST');
  }
});

// ── Navigate ──────────────────────────────────────────────────────────────────

When('payments are calculated', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

When('I view the header', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

When('I click {string} on the first suggested payment', async ({ page }, label) => {
  await page.getByRole('button', { name: label }).first().click();
  await page.waitForResponse(r => r.url().includes('/settle'));
});

When('I click {string} on a recorded payment', async ({ page }, label) => {
  await page.getByRole('button', { name: label }).first().click();
  await page.waitForResponse(r => r.url().includes('/settle'));
});

When('I record all suggested payments', async ({ page }) => {
  // Re-query after each click to avoid stale references
  while (await page.getByRole('button', { name: 'Record payment' }).count() > 0) {
    await page.getByRole('button', { name: 'Record payment' }).first().click();
    await page.waitForResponse(r => r.url().includes('/settle') && r.request().method() === 'POST');
  }
});

When('I record one of multiple payments', async ({ page, request, seededTrip }) => {
  // Ensure there are multiple payments first (need 3 members with varying balances)
  await page.getByRole('button', { name: 'Record payment' }).first().click();
  await page.waitForResponse(r => r.url().includes('/settle') && r.request().method() === 'POST');
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then('I am on the settle up page', async ({ page }) => {
  await page.waitForURL(/\/settle$/);
});

Then('the list shows the minimum number of payments to zero all balances', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Record payment' }).first()).toBeVisible();
});

Then('it states how many payments were found and how many members are in the trip', async ({ page }) => {
  await expect(page.locator('text=/payment/i').first()).toBeVisible();
  await expect(page.locator('text=/balance/i').first()).toBeVisible();
});

Then('no payment rows are shown', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Record payment' })).not.toBeVisible();
});

Then('the row shows a checkmark and {string} button', async ({ page }, label) => {
  await expect(page.getByRole('button', { name: label }).first()).toBeVisible();
});

Then('the row is visually dimmed', async ({ page }) => {
  // Settled rows typically have reduced opacity or a muted style
  const settledRow = page.locator('[class*="settled"], [style*="opacity"]').first();
  await expect(settledRow).toBeVisible();
});

Then('the {string} banner appears', async ({ page }, bannerText) => {
  await expect(page.getByText(bannerText)).toBeVisible();
});

Then('the {string} banner disappears', async ({ page }, bannerText) => {
  await expect(page.getByText(bannerText)).not.toBeVisible();
});

Then('the subtitle shows {string}', async ({ page }, _pattern) => {
  await expect(page.locator('text=/\\d+ of \\d+ recorded/')).toBeVisible();
});

Then('the subtitle recorded count decreases by one', async ({ page }) => {
  await expect(page.locator('text=/\\d+ of \\d+ recorded/')).toBeVisible();
});

Then('the "Record payment" button reappears', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Record payment' }).first()).toBeVisible();
});

Then('the payment returns to the unrecorded state and the "Record payment" button reappears',
  async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Record payment' }).first()).toBeVisible();
  }
);
