# API

**Status:** registration, login, current user, and campground list/detail/create are implemented. Other endpoints remain proposed and unimplemented.

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

Logout (ticket 09, not implemented) clears any issued auth cookie. Postman clears its saved TOKEN after success.
A copied unexpired JWT remains usable. Ticket 01 uses Bearer JWT transport only.

## Adopted booking creation (ticket 04)

POST `/bookings` accepts exactly `campgroundId`, `checkIn`, and `checkOut`. Store dates as validated `YYYY-MM-DD` strings. Return 201 with `{ id, ownerId, campground, checkIn, checkOut }` in `data`; campground contains `id`, `name`, `address`, and `telephone`. Owner comes from authentication. Overlaps and more than three bookings are allowed. Invalid fields/dates return 400 (`Invalid booking fields` / `Invalid booking dates`); campground errors follow the existing 400/404 convention.

## Adopted booking reads (ticket 05)

GET `/bookings` returns only the caller's records ordered by ID ascending, with returned-item `count`. GET `/bookings/:id` returns one owned booking using the creation representation. Historical bookings remain readable. Malformed booking IDs return 400 (`Invalid booking identifier`), absent records 404 (`Booking not found`), and another owner's booking 403 (`Booking access denied`). Authentication precedes ID validation. Administrators are also own-only until ticket 08 implements the broader access described in the endpoint table.

## Adopted booking updates (ticket 06)

PUT `/bookings/:id` accepts a nonempty subset of `campgroundId`, `checkIn`, and `checkOut`. Check ownership before validating the body; reject unknown/ownership/authority fields with 400 (`Invalid booking fields`). Validate the complete merged stay on every edit, including campground-only edits: past dates fail with 400 (`Invalid booking dates`). Owners may reschedule a historical booking to valid current/future dates. Verify the destination exists, preserve the owner, and write the validated campground/date tuple together. Rejected updates preserve the stored booking. Success returns 200 with the public booking in `data`; administrators remain own-only until ticket 08.
