# 09: Log out and demonstrate JWT limits

Status: Plan approved; not started. Not published or labeled in an external tracker.

Human summary: [ticket 09](../../../docs/tickets/09-logout.md). This file retains detailed acceptance criteria.

## What to build

A logged-in client can log out, remove its saved credential, and understand the accepted copied-token limitation.

## Acceptance criteria

- [ ] Provide the logout operation using the finalized documented HTTP convention and clear any authentication cookie the API issues.
- [ ] Have the successful Postman logout request clear its saved token; subsequent requests from that client without credentials fail authentication.
- [ ] Demonstrate that a separately retained valid unexpired JWT is not revoked by logout. Do not add server-stored sessions or a revocation list.
- [ ] Add HTTP tests and a Postman login/logout/protected-request flow. Document token expiry and any actual cookie transport behavior without leaking credentials.

## Blocked by

01: Register, log in, and verify identity
