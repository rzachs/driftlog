const { test: base } = require('playwright-bdd');
const { expect } = require('@playwright/test');
const { createBdd } = require('playwright-bdd');

const test = base.extend({
  seededTrip: async ({ request }, use) => {
    const res = await request.post('/api/trips', {
      data: { name: 'E2E Test Trip', startDate: '2026-01-01', endDate: '2026-01-05', people: ['Maya', 'Sam'] },
    });
    const { id } = await res.json();
    const trip = await (await request.get(`/api/trips/${id}`)).json();
    await use({ id, name: 'E2E Test Trip', members: trip.members });
  },
});

const { Given, When, Then } = createBdd(test);
module.exports = { test, expect, Given, When, Then };
