# API

**Status:** registration, login, current user, logout, campgrounds, and owner/administrator booking CRUD are implemented through ticket 09.

Base path: `/api/v1`. JSON requests. Protected requests use `Authorization: Bearer <token>`.

## Endpoints

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public; creates ordinary user | 201 |
| POST | `/auth/login` | Public | 200 |
| GET | `/auth/me` | Logged-in user | 200 |
| GET | `/auth/logout` | Logged-in user | 200 |
| GET | `/campgrounds` | Logged-in user | 200 |
| GET | `/campgrounds/:id` | Logged-in user | 200 |
| POST | `/campgrounds` | Administrator | 201 |
| POST | `/bookings` | Logged-in user; books for self | 201 |
| GET | `/bookings` | Own bookings; administrator sees all | 200 |
| GET | `/bookings/:id` | Owner or administrator | 200 |
| PUT | `/bookings/:id` | Owner or administrator | 200 |
| DELETE | `/bookings/:id` | Owner or administrator | 200 |

No pagination, filter language, or nested booking endpoints planned.

## Request fields

| Request | Fields |
| --- | --- |
| Register | `name`, `telephone`, `email`, `password` |
| Login | `email`, `password` |
| Create campground | `name`, `address`, `telephone` |
| Create booking | `campgroundId`, `checkIn`, `checkOut` |
| Update booking | Any nonempty subset of `campgroundId`, `checkIn`, `checkOut` |

Example booking:

```json
{
  "campgroundId": "<existing campground identifier>",
  "checkIn": "2026-12-01",
  "checkOut": "2026-12-04"
}
```

Dates use `YYYY-MM-DD`; examples are not fixed test dates.
PUT accepts partial updates and validates the complete merged stay on every update, including campground-only edits. Reject unexpected fields and ownership changes.

Authentication validation: required nonempty string contact fields; telephone stored as a string; trimmed/lowercase unique email with valid email shape; password at least 8 characters and at most 72 UTF-8 bytes. Reject unknown fields, including role. Registration always creates a `user`.
Hash passwords with salted bcrypt at cost 10. Never trim passwords. Public users contain `id`, `name`, `telephone`, `email`, and `role`. Authentication uses one-hour HS256 Bearer JWTs with account ID in `sub`; middleware loads the current stored account. No cookies are issued or accepted.

Campground reads return only `id`, `name`, `address`, and string `telephone`. Lists are ordered by `_id` ascending and include all destinations; an empty list returns `count: 0` and `data: []`. Authentication runs before ID validation. Detail accepts 24-character hexadecimal MongoDB IDs; malformed IDs return 400 (`Invalid campground identifier`) and absent valid IDs return 404 (`Campground not found`).

Campground creation requires the current stored administrator role. Accept exactly `name`, `address`, and `telephone` as trimmed, nonempty strings. Invalid fields or unknown keys return 400 (`Invalid campground fields`). Ordinary users receive 403 (`Administrator access required`) before field validation; missing/invalid authentication receives 401. Success returns 201 with the persisted public campground in `data`, using the same four fields as reads. Created destinations immediately appear in browsing results.

## Responses

- Success: `{ "success": true, "data": ... }`.
- Lists: array in `data`, with returned-item `count`.
- Registration/login: also return top-level `token` and public user data.
- Delete/logout: empty object in `data`.
- Error: `{ "success": false, "message": "..." }`.
- Never return password hashes, unrelated bookings, secrets, or stack traces.

| Error | Status |
| --- | --- |
| Invalid fields, IDs, dates, or duration | 400 |
| Invalid credentials or missing/invalid/expired token | 401 |
| Wrong role or another user's booking | 403 |
| Resource missing | 404 |
| Email already registered | 409 |
| Unexpected server failure | 500 |

GET `/auth/logout` requires a valid Bearer JWT and returns 200 with `{ "success": true, "data": {} }`. Missing, invalid, or expired authentication returns 401 (`Not authorized`). Postman clears its saved `TOKEN` after success; subsequent requests without credentials return 401.

JWTs expire one hour after issuance. Logout does not revoke tokens or change the account; a separately copied unexpired JWT can still authenticate while the account exists. No authentication cookies are issued or accepted, so logout sends no `Set-Cookie` header. No server-side session or revocation list is used.

## Adopted booking creation (ticket 04)

POST `/bookings` accepts exactly `campgroundId`, `checkIn`, and `checkOut`. Store dates as validated `YYYY-MM-DD` strings. Return 201 with `{ id, ownerId, campground, checkIn, checkOut }` in `data`; campground contains `id`, `name`, `address`, and `telephone`. Owner comes from authentication. Overlaps and more than three bookings are allowed. Invalid fields/dates return 400 (`Invalid booking fields` / `Invalid booking dates`); campground errors follow the existing 400/404 convention.

## Adopted booking reads (ticket 05)

GET `/bookings` returns the caller's records, or all records for administrators, ordered by ID ascending with returned-item `count`. GET `/bookings/:id` returns one authorized booking using the creation representation. Historical bookings remain readable. Malformed booking IDs return 400 (`Invalid booking identifier`), absent records 404 (`Booking not found`), and another owner's booking for an ordinary user 403 (`Booking access denied`). Authentication precedes ID validation. Administrators use the same representation and error conventions.

## Adopted booking updates (ticket 06)

PUT `/bookings/:id` accepts a nonempty subset of `campgroundId`, `checkIn`, and `checkOut`. Check owner-or-administrator access before validating the body; reject unknown/ownership/authority fields with 400 (`Invalid booking fields`). Validate the complete merged stay on every edit, including campground-only edits: past dates fail with 400 (`Invalid booking dates`). Owners and administrators may reschedule a historical booking to valid current/future dates. Verify the destination exists, preserve the owner, and write the validated campground/date tuple together. Rejected updates preserve the stored booking. Success returns 200 with the public booking in `data`.

## Adopted booking deletion (ticket 07)

DELETE `/bookings/:id` permanently removes an authorized booking, including a historical stay, and returns 200 with `{ "success": true, "data": {} }`. Authentication and booking-ID/ownership checks use the read conventions. Repeated deletion returns 404. Denied requests preserve the booking; there is no soft deletion or cancellation status. Administrators may delete any owner’s booking.

## Administrator booking access (ticket 08)

The authenticated account’s current stored role determines access on every request. Administrators can list, inspect, update, and delete any booking through the existing endpoints. Update validation and immutable ownership apply equally to every owner; writes match the booking’s stored owner. POST remains self-only for administrators and rejects owner/authority fields. No owner accounts are populated or exposed.
