# Feature: Login with Google

## User story
As a Driftlog user, I want to log in using my Google account,
so that my identity is established without creating a separate password.

## Acceptance criteria

- Given I am on the Login page and not logged in, when I click the Google
  button, then I am redirected to Google's OAuth consent screen.
- Given I have granted consent, when Google redirects me back to Driftlog,
  then I am logged in and taken to /trips.
- Given I am a first-time Google user, when login succeeds, then a Driftlog
  account is created for me automatically from my Google profile.
- Given I am a returning Google user, when login succeeds, then I am signed
  in to my existing Driftlog account (profile synced from Google).
- Given I am already logged in, when I navigate to /login, then I am
  redirected to /trips without going through OAuth again.
- Given I cancel on Google's consent screen, when redirected back, then I
  see an error message on the Login page and remain logged out.
- Given Google returns an OAuth error, when Driftlog processes the callback,
  then I see an error message on the Login page and remain logged out.

## Business rules

| Scenario | Input | Expected output |
|---|---|---|
| Initiate OAuth | User clicks Google button | Server generates a random state token (CSRF), stores it in the session, redirects to Google with: client_id, redirect_uri, scope=`email profile`, response_type=code, state |
| State mismatch on callback | callback `state` ≠ session state | Redirect to `/login?error=csrf`. No user record created or modified. |
| Google returns error on callback | callback has `error` param | Redirect to `/login?error=oauth_failed`. No user record created or modified. |
| First-time user | Google `sub` not found in `users` table | INSERT into `users`: google_id=sub, email=Google email, display_name=Google name. Establish session. Redirect to `/trips`. |
| Returning user | Google `sub` found in `users` table | UPDATE `users` row: sync email and display_name from Google profile. Establish session. Redirect to `/trips`. |
| Session established | Successful login (either row above) | Session cookie set (httpOnly, sameSite=lax). Session expiry: 7 days. |
| Already logged in | GET /login with valid session | Redirect to `/trips`. No OAuth initiated. |
| DB error on upsert | DB failure during user create/update | Redirect to `/login?error=server_error`. |
| Error message display | /login?error=<code> | Visible inline error shown above the login form. Messages: `csrf` → "Login failed — please try again"; `oauth_failed` → "Google sign-in was cancelled or failed"; `server_error` → "Something went wrong — please try again". |
| OAuth callback route | GET /auth/google/callback?code=&state= | New route added to server.js. Must also be registered as an authorized redirect URI in Google Cloud Console. |
| Trip scoping | GET /api/trips with valid session | Returns only trips where `created_by = session user id`. The `trips` table gets a `created_by` column (FK to `users.id`). POST /api/trips sets `created_by` to the session user's id. Existing trips without `created_by` are not visible to any user. |
| "You" identity in balances | Viewing balances for a trip | The logged-in user's `display_name` is matched against `trip_members.name` to identify which member is "You" in balance calculations. The caller's identity shifts from a hardcoded string to `session.user.display_name`. |

## Out of scope
- Email/password login (separate feature)
- Microsoft, Apple, Facebook login (separate features)
- Logout / session invalidation (separate feature)
- Account linking (Google account ↔ existing email/password account)
- Changing display name after sign-up
- Trip access control enforcement beyond the owner (sharing trips with other users)

## Known gaps
- None. All rows resolved.
