# API contract

Status: Ticket 01 adopts the authentication contract; other concrete conventions remain proposed. Business behavior is agreed in [requirements](requirements.md); exact paths, JSON field names, response envelopes, and status choices below are recommendations. Registration, login, and current-user endpoints are implemented; see [implementation conventions](auth-implementation.md).

## Conventions

Proposed base path: `/api/v1`. Use JSON bodies, string MongoDB identifiers, and Bearer JWT authentication on protected requests. Return success as `{ "success": true, "data": ... }` and errors as `{ "success": false, "message": "..." }`. Lists return an array in `data` and a `count` equal to the number returned. This initial scope has no pagination/filter language.

Authentication responses additionally return a top-level `token` so the Postman collection can save it. Public user representations contain identity/contact fields and role, never a password/hash. Booking responses contain only that authorized booking and relevant campground details, never another user's password or unrelated bookings.

## Routes and traceability

All paths below are relative to `/api/v1`.

| Method | Path | Access | Success | Requirement |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Public; creates ordinary user | 201 + token and public user | FR-01 |
| POST | `/auth/login` | Public | 200 + token and public user | FR-02 |
| GET | `/auth/me` | Authenticated | 200 + public current user | Supporting authentication check |
| GET | `/auth/logout` | Authenticated | 200; clear issued auth cookie | FR-02; lecture-compatible method |
| GET | `/campgrounds` | Authenticated | 200 + campground list | FR-03 |
| GET | `/campgrounds/:id` | Authenticated | 200 + campground | Supports selection for FR-03 |
| POST | `/campgrounds` | Administrator | 201 + new campground | Agreed supporting behavior |
| POST | `/bookings` | Authenticated; owner is caller | 201 + new booking | FR-03 |
| GET | `/bookings` | Own for user; all for administrator | 200 + booking list | FR-04, FR-07 |
| GET | `/bookings/:id` | Owner or administrator | 200 + booking | FR-04, FR-07 |
| PUT | `/bookings/:id` | Owner or administrator | 200 + updated booking | FR-05, FR-08 |
| DELETE | `/bookings/:id` | Owner or administrator | 200 + empty object in `data` | FR-06, FR-09 |

Use partial field updates for the proposed booking PUT, matching the baseline's update style. Validate the merged complete booking. No nested campground booking list is planned, avoiding a second path that could leak other users' bookings.

## Request representations

Register:

```json
{
  "name": "Example User",
  "telephone": "0812345678",
  "email": "example@example.com",
  "password": "<user-supplied password>"
}
```

Login uses only `email` and `password`. Campground creation uses `name`, `address`, and `telephone` as nonempty strings. Telephone values remain strings to preserve leading zeroes.

Create booking:

```json
{
  "campgroundId": "<existing campground identifier>",
  "checkIn": "2026-12-01",
  "checkOut": "2026-12-04"
}
```

These dates are examples, not hardcoded test fixtures. Repeatable tests generate dates relative to the Thailand calendar. Updates may contain `campgroundId`, `checkIn`, and/or `checkOut`; reject an empty update, ownership/role changes, and unexpected fields. Creation never takes an owner ID from the client.

Implemented authentication validation: trim names/contact fields, normalize email by trimming and lowercasing, enforce a unique normalized email, validate email shape, require a password of at least 8 characters and at most 72 UTF-8 bytes, reject unknown fields (including role), and use salted bcrypt at cost 10. Public users contain `id`, `name`, `telephone`, `email`, and `role`. Tokens are one-hour HS256 JWTs with account ID in `sub`. Do not trim or otherwise silently alter passwords. Treat these as application validation conventions, not additional claims about the professor's wording.

## HTTP errors

| Status | Meaning |
| --- | --- |
| 400 | Missing/invalid fields, malformed IDs, invalid calendar dates, past changed check-in, invalid duration, empty update, unexpected fields |
| 401 | Invalid credentials; missing, invalid, or expired JWT; token identifies no current account |
| 403 | Authenticated caller lacks administrator access or does not own the booking |
| 404 | Validly formed resource identifier has no corresponding resource |
| 409 | Registration conflicts with an existing normalized email |
| 500 | Unexpected internal failure; do not return credentials, database internals, or stack traces |

Authentication/role middleware runs before protected resource operations. For booking ownership, load the booking and then enforce owner-or-admin before returning data or making any change.

## Logout limits

Propose retaining the lecture's GET logout path and token response style for easy comparison. The Postman logout request clears its saved TOKEN after a successful response; the server clears an authentication cookie if one was issued. A subsequent request without credentials returns 401. A separately copied unexpired JWT may still authenticate, as explicitly accepted in ADR-0007. Do not describe client token deletion as server-side revocation. Ticket 01 issues and accepts no cookies; authentication uses Bearer JWTs. Logout remains ticket 09.
