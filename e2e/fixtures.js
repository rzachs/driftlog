const { test: base } = require('playwright-bdd');
const { expect } = require('@playwright/test');
const { createBdd } = require('playwright-bdd');

const test = base.extend({
  seededTrip: async ({ page }, use) => {
    const res = await page.request.post('/api/trips', {
      data: { name: 'E2E Test Trip', startDate: '2026-01-01', endDate: '2026-01-05', people: ['Maya', 'Sam'] },
    });
    const { id } = await res.json();
    const trip = await (await page.request.get(`/api/trips/${id}`)).json();
    await use({ id, name: 'E2E Test Trip', members: trip.members });
  },
});

const { Given, When, Then, Before } = createBdd(test);

// Establish a browser session before every non-auth scenario.
// Auth scenarios manage their own login flow.
Before({ tags: 'not @auth' }, async ({ page }) => {
  await page.goto('/auth/test-login?sub=e2e-user&name=You&email=you%40example.com');
  await page.waitForURL('**/trips');
});

module.exports = { test, expect, Given, When, Then };
