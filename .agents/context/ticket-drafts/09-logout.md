# 09: Log out and demonstrate JWT limits

Status: Implemented and locally verified. See [evidence](../logout-implementation.md). Not published or labeled in an external tracker.

Human summary: [ticket 09](../../../docs/tickets/09-logout.md). This file retains detailed acceptance criteria.

## What to build

A logged-in client can log out, remove its saved credential, and understand the accepted copied-token limitation.

## Acceptance criteria

- [x] Provide the logout operation using the finalized documented HTTP convention and clear any authentication cookie the API issues.
- [x] Have the successful Postman logout request clear its saved token; subsequent requests from that client without credentials fail authentication.
- [x] Demonstrate that a separately retained valid unexpired JWT is not revoked by logout. Do not add server-stored sessions or a revocation list.
- [x] Add HTTP tests and a Postman login/logout/protected-request flow. Document token expiry and any actual cookie transport behavior without leaking credentials.

## Blocked by

01: Register, log in, and verify identity
