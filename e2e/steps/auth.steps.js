const { Given, When, Then, expect } = require('../fixtures');

// Shared state for first-time / returning user scenarios — set in Given, used in When
let _sub, _name, _email;

// ── Givens ────────────────────────────────────────────────────────────────────

Given('I am on the login page and not logged in', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
});

Given("I have completed Google's OAuth consent", async () => {
  // Consent is simulated in the When step via /auth/test-login
});

Given('I am a first-time Google user', async () => {
  // Unique sub ensures this user does not exist in the DB yet
  _sub = `first-time-${Date.now()}`;
  _name = 'First Timer';
  _email = 'firsttimer@example.com';
});

Given('I am a returning Google user', async ({ request }) => {
  _sub = 'returning-user-e2e';
  _name = 'Returning User';
  _email = 'returning@example.com';
  // Create the user record (simulates their prior login)
  await request.get(
    `/auth/test-login?sub=${_sub}&name=${encodeURIComponent(_name)}&email=${encodeURIComponent(_email)}`
  );
});

Given('I am already logged in', async ({ page }) => {
  await page.goto('/auth/test-login?sub=already-logged-in-e2e&name=Logged%20In&email=loggedin%40example.com');
  await page.waitForURL('**/trips');
});

Given("I have cancelled on Google's consent screen", async () => {
  // The When step navigates directly to the callback with error param
});

Given('Google has returned an OAuth error on the callback', async () => {
  // The When step navigates directly to the callback with error param
});

// ── Whens ─────────────────────────────────────────────────────────────────────

When('I click the Google sign-in button', async ({ page }) => {
  // Intercept the redirect to accounts.google.com so the test stays local
  await page.route('https://accounts.google.com/**', route =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>Mock Google Consent</body></html>' })
  );
  await page.locator('button').filter({ hasText: 'Google' }).click();
  await page.waitForURL(/accounts\.google\.com/, { timeout: 8000 });
});

When('Google redirects me back to Driftlog', async ({ page }) => {
  // Simulate the successful OAuth callback via the test-login shortcut
  await page.goto('/auth/test-login?sub=oauth-callback-e2e&name=OAuth%20User&email=oauth%40example.com');
  await page.waitForURL('**/trips');
});

When('I complete login', async ({ page }) => {
  await page.goto(
    `/auth/test-login?sub=${encodeURIComponent(_sub)}&name=${encodeURIComponent(_name)}&email=${encodeURIComponent(_email)}`
  );
  await page.waitForURL('**/trips');
});

When(/^I navigate to \/login$/, async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
});

When('I am redirected back to Driftlog', async ({ page }) => {
  // Simulate Google returning error=access_denied (user cancelled)
  await page.goto('/auth/google/callback?error=access_denied');
  await page.waitForLoadState('networkidle');
});

When('Driftlog processes the callback', async ({ page }) => {
  // Simulate Google returning a generic OAuth error
  await page.goto('/auth/google/callback?error=server_error');
  await page.waitForLoadState('networkidle');
});

// ── Thens ─────────────────────────────────────────────────────────────────────

Then("I am redirected to Google's OAuth consent screen", async ({ page }) => {
  expect(page.url()).toMatch(/accounts\.google\.com/);
});

Then(/^I am logged in and taken to \/trips$/, async ({ page }) => {
  expect(page.url()).toMatch(/\/trips$/);
});

Then('a Driftlog account is created from my Google profile', async ({ page }) => {
  expect(page.url()).toMatch(/\/trips$/);
  const me = await (await page.request.get('/api/me')).json();
  expect(me.displayName).toBe(_name);
});

Then('I am signed in to my existing account with profile synced', async ({ page, request }) => {
  expect(page.url()).toMatch(/\/trips$/);
  const me = await (await request.get('/api/me')).json();
  expect(me.displayName).toBe(_name);
});

Then(/^I am redirected to \/trips without OAuth$/, async ({ page }) => {
  await page.waitForURL('**/trips');
  expect(page.url()).toMatch(/\/trips$/);
});

Then('I see an error message on the login page', async ({ page }) => {
  await page.waitForURL(/\/login/);
  await expect(
    page.getByText(/sign-in was cancelled or failed|failed.*try again|went wrong.*try again/i).first()
  ).toBeVisible();
});

Then('I remain logged out', async ({ request }) => {
  const res = await request.get('/api/me');
  expect(res.status()).toBe(401);
});

// ── Logout steps ──────────────────────────────────────────────────────────────

// [AC: I am logged in] — shared Given for logout scenarios
Given('I am logged in', async ({ page }) => {
  await page.goto('/auth/test-login?sub=logout-e2e&name=Logout%20User&email=logout%40example.com');
  await page.waitForURL('**/trips');
});

// [AC: Open account menu] — row "Toggle account menu"
When('I open the account menu', async ({ page }) => {
  await page.getByRole('button', { name: 'Account menu' }).click();
  await page.waitForSelector('[aria-label="Account menu"] ~ div, [aria-label="Account menu"] + div', { state: 'attached' });
});

// [AC: Close menu on click-away] — row "Close menu on click-away"
When('I click outside the menu', async ({ page }) => {
  await page.locator('header').locator('div.fixed').click();
});

// [AC: Click Log out] — row "Logout request"
When('I click Log out', async ({ page }) => {
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.waitForLoadState('networkidle');
});

// [AC: Navigate to /trips after logout] — row "Protected route after logout"
When(/^I navigate to \/trips$/, async ({ page }) => {
  await page.goto('/trips');
  await page.waitForLoadState('networkidle');
});

// [AC: dropdown shows name and email] — rows "Toggle account menu", "User info in menu"
Then('I see the account dropdown with my name and email', async ({ page }) => {
  await expect(page.getByText('Logout User')).toBeVisible();
  await expect(page.getByText('logout@example.com')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
});

// [AC: dropdown closes] — row "Close menu on click-away"
Then('the dropdown closes', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Log out' })).not.toBeVisible();
});

// [AC: redirected to login] — row "Client redirect"
Then('I am on the login page', async ({ page }) => {
  expect(page.url()).toMatch(/\/(login)?$/);
});

// [AC: session is gone] — row "Server destroys session"
Then('my session is gone', async ({ page }) => {
  const res = await page.request.get('/api/me');
  expect(res.status()).toBe(401);
});

// [AC: still logged in after click-away] — row "Close menu on click-away"
Then('I am still logged in', async ({ page }) => {
  const res = await page.request.get('/api/me');
  expect(res.status()).toBe(200);
});
