# API contract

Status: Tickets 01–09 implement authentication/logout, campgrounds, and owner/administrator booking CRUD. Human-facing [API documentation](../../docs/api-contract.md) is authoritative. See [logout evidence](logout-implementation.md), [authentication conventions](auth-implementation.md), [campground conventions](campgrounds-implementation.md), [booking conventions](bookings-implementation.md), and [administrator evidence](admin-bookings-implementation.md).

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
| GET | `/auth/logout` | Authenticated | 200 + empty object in `data`; client clears token | FR-02; lecture-compatible method |
| GET | `/campgrounds` | Authenticated | 200 + campground list | FR-03 |
| GET | `/campgrounds/:id` | Authenticated | 200 + campground | Supports selection for FR-03 |
| POST | `/campgrounds` | Administrator | 201 + new campground | Agreed supporting behavior |
| POST | `/bookings` | Authenticated; owner is caller | 201 + new booking | FR-03 |
| GET | `/bookings` | Own for user; all for administrator | 200 + booking list | FR-04, FR-07 |
| GET | `/bookings/:id` | Owner or administrator | 200 + booking | FR-04, FR-07 |
| PUT | `/bookings/:id` | Owner or administrator | 200 + updated booking | FR-05, FR-08 |
| DELETE | `/bookings/:id` | Owner or administrator | 200 + empty object in `data` | FR-06, FR-09 |

Use partial field updates for the implemented booking PUT, matching the baseline's update style. Validate the complete merged stay on every update, including campground-only edits. Administrators can access other owners’ bookings as implemented in ticket 08; ordinary-user access remains own-only. No nested campground booking list is planned, avoiding a second path that could leak other users' bookings.

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

## Adopted campground reads

Return only `{ id, name, address, telephone }`, with string telephone values and no booking lists. List all destinations ordered by `_id` ascending, with returned-item `count`; empty data is `[]`. Detail validates a 24-character hexadecimal ID after authentication, returning 400 for malformed IDs and 404 for absent records. The seed command uses fixed fixture ObjectIds and `$setOnInsert`; names are not unique. See [ticket 02 evidence](campgrounds-implementation.md) for fixtures and verification.

## HTTP errors

| Status | Meaning |
| --- | --- |
| 400 | Missing/invalid fields, malformed IDs, invalid calendar dates, past resulting check-in on any create/update, invalid duration, empty update, unexpected fields |
| 401 | Invalid credentials; missing, invalid, or expired JWT; token identifies no current account |
| 403 | Authenticated caller lacks administrator access or does not own the booking |
| 404 | Validly formed resource identifier has no corresponding resource |
| 409 | Registration conflicts with an existing normalized email |
| 500 | Unexpected internal failure; do not return credentials, database internals, or stack traces |

Authentication/role middleware runs before protected resource operations. For booking ownership, load the booking and then enforce owner-or-administrator access before returning data or making any change, using the current stored account role.

## Logout limits

Ticket 09 adopts authenticated GET `/auth/logout`, returning 200 with `{ "success": true, "data": {} }`. The Postman logout request clears its saved TOKEN after success; subsequent requests without credentials return 401. A separately copied unexpired JWT remains usable, as accepted in ADR-0007. Tokens expire one hour after issuance. Authentication uses Bearer headers only: no cookies are issued or accepted, and logout emits no `Set-Cookie`. There is no server-side revocation or session state. See [implementation evidence](logout-implementation.md).

Ticket 03 implements administrator campground POST with strict trimmed nonempty string fields, current stored role enforcement, and the existing public serializer. See [administrator conventions and evidence](admin-campgrounds-implementation.md).

Booking creation, public response fields, read/update/delete conventions, finalized date representation, and local verification are recorded in [booking implementation evidence](bookings-implementation.md) and the [human API contract](../../docs/api-contract.md).
