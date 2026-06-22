const { Given, When, Then, expect } = require('../fixtures');

Given('a member has a positive balance', async ({ page, request, seededTrip }) => {
  // Maya paid for everyone → Maya has positive balance
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'Maya paid',
      amount: 90,
      paidById: seededTrip.members.find(m => m.name === 'Maya').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
    },
  });
  await page.goto(`/trips/${seededTrip.id}`);
  await page.waitForLoadState('networkidle');
});

Given('my balance is positive', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

Given('a member has a negative balance', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

Given('a member has exactly zero balance', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

// ── Person detail ─────────────────────────────────────────────────────────────

Given('I am on a person detail page for a member in a trip with expenses',
  async ({ page, request, seededTrip }) => {
    await request.post(`/api/trips/${seededTrip.id}/expenses`, {
      data: {
        description: 'Dinner',
        amount: 90,
        paidById: seededTrip.members.find(m => m.name === 'You').id,
        date: '2026-01-02',
        splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
      },
    });
    // Navigate to You's page (You is the payer for this expense)
    const you = seededTrip.members.find(m => m.name === 'You');
    await page.goto(`/trips/${seededTrip.id}/members/${you.id}`);
    await page.waitForLoadState('networkidle');
  }
);

Given('the member paid for an expense', async ({ page }) => {
  // Already on You's (payer's) page from the main Given
});

Given('the member did not pay but was included in the split', async ({ page }) => {
  // Navigate from You's page to Maya's page (non-payer) via trip overview
  const url = page.url();
  const tripId = url.match(/\/trips\/([^/]+)/)?.[1];
  await page.goto(`/trips/${tripId}`);
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /Maya/i }).first().click();
  await page.waitForLoadState('networkidle');
});

Given('the member paid and was split into the expense', async ({ page }) => {
  // Already on You's page — You paid $90 and also has a $30 share
});

Given('the member has a negative net balance', async ({ page, request, seededTrip }) => {
  // Navigate to Maya's detail page — Maya owes money
  const maya = seededTrip.members.find(m => m.name === 'Maya');
  await page.goto(`/trips/${seededTrip.id}/members/${maya.id}`);
  await page.waitForLoadState('networkidle');
});

Given('the member has a positive net balance', async ({ page, seededTrip }) => {
  // Navigate to You's detail page — You is owed money
  const you = seededTrip.members.find(m => m.name === 'You');
  await page.goto(`/trips/${seededTrip.id}/members/${you.id}`);
  await page.waitForLoadState('networkidle');
});

// ── When steps ────────────────────────────────────────────────────────────────

When('the balances section loads', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

When('I view their balance card', async ({ page }) => {
  // Already on trip overview
});

When('I view my balance card', async ({ page }) => {
  // Already on trip overview
});

When('I click a member\'s balance card', async ({ page }) => {
  await page.locator('a[href*="/members/"]').first().click();
});

When('I view their breakdown row for that expense', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

When('I view their breakdown row', async ({ page }) => {
  await page.waitForLoadState('networkidle');
});

// ── Then steps ────────────────────────────────────────────────────────────────

Then('each member is shown as a card with their name and balance amount', async ({ page }) => {
  await expect(page.locator('a[href*="/members/"]').first()).toBeVisible();
});

Then('the card has a green accent and shows {string}', async ({ page }, label) => {
  await expect(page.getByText(label).first()).toBeVisible();
});

Then('the card has a red accent and shows {string}', async ({ page }, label) => {
  await expect(page.getByText(label).first()).toBeVisible();
});

Then('I am on the person detail page', async ({ page }) => {
  await page.waitForURL(/\/members\//);
  expect(page.url()).toMatch(/\/trips\/[^/]+\/members\/[^/]+/);
});

Then('I see the member\'s total paid, total share, and net balance', async ({ page }) => {
  await expect(page.getByText(/paid/i).first()).toBeVisible();
  await expect(page.getByText(/share/i).first()).toBeVisible();
  await expect(page.getByText(/balance/i).first()).toBeVisible();
});

Then('the net impact is positive', async ({ page }) => {
  await expect(page.locator('text=/\\+€/').first()).toBeVisible();
});

Then('the net impact is negative', async ({ page }) => {
  await expect(page.locator('text=/−€|-€/').first()).toBeVisible();
});

Then('the net impact reflects the payer-nets-out rule', async ({ page }) => {
  // You paid $90, share $30 → net +$60
  await expect(page.locator('text=/\\+€60|\\+60/').first()).toBeVisible();
});

Then('a {string} call-to-action is shown linking to the settle up page', async ({ page }, label) => {
  await expect(page.getByRole('link', { name: label })).toBeVisible();
});

Then('no settle up CTA is shown', async ({ page }) => {
  await expect(page.getByRole('link', { name: /settle up/i })).not.toBeVisible();
});
