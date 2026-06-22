const { Given, When, Then, expect } = require('../fixtures');

Given('I am on the trips page', async ({ page }) => {
  await page.goto('/trips');
  await page.waitForURL('**/trips');
});

Given('I am on a trip overview', async ({ page, seededTrip }) => {
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

Given('I am on the add expense form for a trip', async ({ page, seededTrip }) => {
  await page.goto(`/trips/${seededTrip.id}/add-expense`);
  await page.waitForLoadState('networkidle');
});

Given('I am on a trip overview with members and expenses', async ({ page, request, seededTrip }) => {
  // Add an expense so balances are non-zero
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'Setup expense',
      amount: 90,
      paidById: seededTrip.members.find(m => m.name === 'You').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
    },
  });
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

Given('I am on a trip overview with unbalanced expenses', async ({ page, request, seededTrip }) => {
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'Setup expense',
      amount: 90,
      paidById: seededTrip.members.find(m => m.name === 'You').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
    },
  });
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

Then('I am on the trip overview for {string}', async ({ page }, tripName) => {
  await page.waitForURL(/\/trips\/[^/]+$/);
  await expect(page.locator('h1')).toContainText(tripName);
});

Then('the URL matches \\/trips\\/:id\\/members\\/:memberId', async ({ page }) => {
  expect(page.url()).toMatch(/\/trips\/[^/]+\/members\/[^/]+/);
});

Then('I see {string}', async ({ page }, text) => {
  await expect(page.getByText(text).first()).toBeVisible();
});
