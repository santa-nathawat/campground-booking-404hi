# API

**Status:** registration, login, current user, and campground list/detail are implemented. Other endpoints remain proposed and unimplemented.

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
PUT accepts partial updates and validates the merged booking. Reject unexpected fields and ownership changes.

Authentication validation: required nonempty string contact fields; telephone stored as a string; trimmed/lowercase unique email with valid email shape; password at least 8 characters and at most 72 UTF-8 bytes. Reject unknown fields, including role. Registration always creates a `user`.
Hash passwords with salted bcrypt at cost 10. Never trim passwords. Public users contain `id`, `name`, `telephone`, `email`, and `role`. Authentication uses one-hour HS256 Bearer JWTs with account ID in `sub`; middleware loads the current stored account. No cookies are issued or accepted.

Campground reads return only `id`, `name`, `address`, and string `telephone`. Lists are ordered by `_id` ascending and include all destinations; an empty list returns `count: 0` and `data: []`. Authentication runs before ID validation. Detail accepts 24-character hexadecimal MongoDB IDs; malformed IDs return 400 (`Invalid campground identifier`) and absent valid IDs return 404 (`Campground not found`).

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
