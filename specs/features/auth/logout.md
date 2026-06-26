# Feature: Logout

## User story
As a logged-in user, I want to log out of Driftlog,
so that my session is ended and my account is inaccessible from this browser.

## Acceptance criteria

- Given I am logged in, when I click my avatar in the header, then an account
  dropdown opens showing my display name, email address, and a "Log out" button.
- Given the account dropdown is open, when I click outside it, then it closes
  without ending my session.
- Given the account dropdown is open, when I click "Log out", then my session
  is destroyed on the server and I am redirected to /login.
- Given I have logged out, when I navigate to any protected route (e.g. /trips),
  then I am redirected to /login.
- Given my logout request fails on the server, when the response is received,
  then I am still redirected to /login (logout is best-effort).

## Business rules

| Scenario | Input | Expected output |
|---|---|---|
| Toggle account menu | User clicks avatar button in header | `userMenuOpen` toggles; click must not bubble to the click-away backdrop |
| Close menu on click-away | User clicks outside the open dropdown | `userMenuOpen` becomes false; no session change |
| User info in menu | Account dropdown opens | Shows `session.user.display_name` as the name and `session.user.email` as the email |
| Logout request | User clicks "Log out" | Client sends POST /api/auth/logout |
| Server destroys session | POST /api/auth/logout (any session state) | Server calls `req.session.destroy()`; clears session cookie via `res.clearCookie`; responds 200 |
| Client redirect | 200 response from POST /api/auth/logout | Client navigates to /login |
| Server error on destroy | `req.session.destroy()` callback receives an error | Server still responds 200; client still navigates to /login (session will expire per TTL) |
| Protected route after logout | Any authenticated route with no valid session | Existing auth middleware redirects to /login — no change to middleware required |
| `email` in UserContext | Session user object is bootstrapped on the client | `UserContext` must expose `email` alongside `displayName`; the session bootstrap endpoint (or `/api/me`) must include `email` in its response |

## Out of scope
- Logout from all devices / revoking all sessions across browsers
- Auto-logout on session expiry (already handled server-side by session TTL, per `login-with-google` spec)
- Confirmation dialog before logging out
- "Remember me" / persistent sessions
