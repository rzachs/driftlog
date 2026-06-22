const { defineConfig, devices } = require('@playwright/test');
const { defineBddConfig } = require('playwright-bdd');

const testDir = defineBddConfig({
  features: 'e2e/features/**/*.feature',
  steps: ['e2e/fixtures.js', 'e2e/steps/**/*.js'],
});

module.exports = defineConfig({
  testDir,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && node e2e/cleanup-db.js && npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 60_000,
    env: { DB_PATH: 'driftlog-test.db', PORT: '3000', SKIP_SEED: 'true' },
  },
});
