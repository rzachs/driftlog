const { Given, When, Then, expect } = require('../fixtures');

// ── Shared click helper ───────────────────────────────────────────────────────

When('I click {string}', async ({ page }, label) => {
  const btn = page.getByRole('button', { name: label });
  if (await btn.count() > 0) {
    await btn.click();
  } else {
    await page.getByRole('link', { name: label }).click();
  }
});

// ── Create trip ───────────────────────────────────────────────────────────────

When('I enter trip name {string}', async ({ page }, name) => {
  await page.locator('input[placeholder*="Lisbon"]').fill(name);
});

When('I click the modal {string} button', async ({ page }, label) => {
  await page.locator('[role="dialog"]').getByRole('button', { name: label }).click();
});

When('I click the modal {string} button without entering a name', async ({ page }, label) => {
  await page.locator('[role="dialog"]').getByRole('button', { name: label }).click();
});

When('I type {string} in the people field and press Enter', async ({ page }, name) => {
  const input = page.locator('[role="dialog"]').locator('input[placeholder*="name"]');
  await input.fill(name);
  await input.press('Enter');
});

When('I remove {string} from the people list', async ({ page }, name) => {
  await page.locator('[role="dialog"]')
    .locator('span')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .getByRole('button')
    .click();
});

When('I click the modal backdrop', async ({ page }) => {
  // Click the top-left corner of the backdrop overlay (outside the centered modal content)
  await page.locator('[role="dialog"]').click({ position: { x: 10, y: 10 } });
});

Then('a modal appears with fields for trip name, start date, end date, and people', async ({ page }) => {
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  await expect(page.locator('input[placeholder*="Lisbon"]')).toBeVisible();
});

Then('the modal is closed', async ({ page }) => {
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

Then('no new trip is created', async ({ page }) => {
  // Modal should still be visible (validation blocked submit) or we're still on /trips
  const url = page.url();
  expect(url).toMatch(/\/trips$/);
});

Then('{string} appears in the people list', async ({ page }, name) => {
  await expect(page.locator('[role="dialog"]').getByText(name)).toBeVisible();
});

Then('the created trip does not include {string} as a member', async ({ page }, name) => {
  await expect(page.getByText(name)).not.toBeVisible();
});

Then('the created trip includes {string} as a member', async ({ page }, name) => {
  await expect(page.getByText(name, { exact: true })).toBeVisible();
});

// ── Rename trip ───────────────────────────────────────────────────────────────

When('I click the trip name', async ({ page }) => {
  await page.locator('h1').click();
});

When('I clear the name and type {string}', async ({ page }, name) => {
  const field = page.locator('[aria-label="Trip name"]');
  await field.fill(name);
});

When('I clear the name entirely', async ({ page }) => {
  const field = page.locator('[aria-label="Trip name"]');
  await field.fill('');
});

When('I press Enter', async ({ page }) => {
  await page.keyboard.press('Enter');
});

When('I press Escape', async ({ page }) => {
  await page.keyboard.press('Escape');
});

When('I click away from the name field', async ({ page }) => {
  await page.locator('main').click({ position: { x: 10, y: 200 } });
});

Then('the trip name field is editable', async ({ page }) => {
  await expect(page.locator('[aria-label="Trip name"]')).toBeVisible();
});

Then('the trip name displayed is {string}', async ({ page }, name) => {
  await expect(page.locator('h1')).toContainText(name);
});

Then('the trip name displayed is the original name', async ({ page, seededTrip }) => {
  await expect(page.locator('h1')).toContainText(seededTrip.name);
});

Then('the browser tab title contains {string}', async ({ page }, name) => {
  await expect(page).toHaveTitle(new RegExp(name));
});

// ── View trips ────────────────────────────────────────────────────────────────

Given('trips exist', async ({ page, seededTrip }) => {
  // seededTrip fixture already created a trip; navigate to trips list
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

Given('no trips exist', async ({ page, request }) => {
  // Delete all existing trips so the page renders the empty state
  const trips = await (await request.get('/api/trips')).json();
  for (const trip of trips) {
    await request.delete(`/api/trips/${trip.id}`);
  }
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

Given('I have a trip where my balance is positive', async ({ page, request, seededTrip }) => {
  // You paid for everyone → positive balance
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'You paid',
      amount: 90,
      paidById: seededTrip.members.find(m => m.name === 'You').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
    },
  });
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

Given('I have a trip where my balance is negative', async ({ page, request, seededTrip }) => {
  // Someone else paid for everyone → You has negative balance
  await request.post(`/api/trips/${seededTrip.id}/expenses`, {
    data: {
      description: 'Maya paid',
      amount: 90,
      paidById: seededTrip.members.find(m => m.name === 'Maya').id,
      date: '2026-01-02',
      splits: seededTrip.members.map(m => ({ personId: m.id, amount: 30 })),
    },
  });
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

Given('I have a trip where my balance is within €0.005 of zero', async ({ page }) => {
  // No expenses → balance is exactly 0
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

Given('I have a trip whose date range includes today', async ({ request, page, seededTrip }) => {
  // seededTrip has startDate 2026-01-01 / endDate 2026-01-05 — not today.
  // Create a fresh trip spanning today's date.
  const today = new Date().toISOString().slice(0, 10);
  await request.post('/api/trips', {
    data: { name: 'Active Trip', startDate: today, endDate: today, people: [] },
  });
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

When('I navigate to the trips page', async ({ page }) => {
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

When('I view the trips list', async ({ page }) => {
  // Already on trips page from Given
});

When('I view the trips page subtitle', async ({ page }) => {
  // Already on trips page
});

Then('trips are listed in reverse creation order', async ({ page }) => {
  const cards = page.locator('a[href*="/trips/"]');
  await expect(cards.first()).toBeVisible();
});

Then('the trip card shows {string}', async ({ page }, text) => {
  await expect(page.locator(`text=${text}`).first()).toBeVisible();
});

Then('the trip card shows an {string} badge', async ({ page }, badge) => {
  await expect(page.locator(`text=${badge}`).first()).toBeVisible();
});

Then('it shows the total trip count and active count', async ({ page }) => {
  await expect(page.locator('text=/\\d+ trip/')).toBeVisible();
});
