# Administrator booking management — ticket 08

## Adopted behavior

The existing booking endpoints now authorize the current stored administrator role to list, inspect, edit, and delete every owner's bookings. Ordinary-user lists remain owner-filtered, and single-record access rejects other owners with 403. Lists preserve ascending ID order and the existing public booking/campground representation, with no populated owner accounts.

Controllers pass authenticated identity and role to the booking service. The shared lookup validates the ID, loads the booking, and checks owner-or-administrator access before returning it or validating update fields. Update/delete filters match the authorized booking's stored owner; substituting the administrator's identity would incorrectly prevent cross-owner writes. Ownership is never updated. Concurrent authorized edits retain complete-tuple last-write-wins behavior; concurrent deletion returns 404.

Creation still accepts only campgroundId/checkIn/checkOut and derives owner from the authenticated account, including for administrators. All edits reuse strict input parsing and complete merged-stay validation. Historical stays can be read/deleted but must be rescheduled to a valid current/future stay for an edit. No authentication changes, alternate credentials, new routes, or models were added.

## HTTP coverage

Booking tests now include three distinct accounts and the complete user A/user B/administrator detail/update/delete matrix, all-owner ordered/public listing, ordinary-user isolation, administrator personal booking CRUD, and preservation of unrelated records. Tests cover strict fields/ownership injection, malformed and missing destinations/booking IDs, rejected merged dates with unchanged persistence, 1–3-night administrator creation, invalid administrator dates, historical rescheduling/deletion, and existing-token promotion/demotion. A validly signed token carrying an administrator role claim cannot elevate an ordinary stored account. Existing missing/invalid/expired-token checks remain in place for all operations.

## Verification — 2026-11-16 (Asia/Bangkok)

- macOS, Node.js 26.12.1, npm 11.20.0, locked dependencies; Postman CLI 1.76.0.
- `npm run typecheck`: passed for application and test code.
- `npm run build`: passed.
- `npm test`: 163 tests passed across six files, including 65 booking tests.
- Built API bound to a random localhost port, backed by MongoMemoryServer, with three seeded campground fixtures. An ephemeral administrator was provisioned through `npm run setup:admin` against that disposable database. No `.env` database or Atlas was used.
- All five local Postman collections ran sequentially using a temporary environment and `--no-report-events`; every run exited 0 with zero failures.

| Collection | Requests | Assertions |
| --- | ---: | ---: |
| Authentication | 9 | 26 |
| Campground browsing | 11 | 40 |
| Administrator campground creation | 10 | 29 |
| Owned booking lifecycle | 29 | 75 |
| Administrator bookings | 58 | 174 |
| Total | 117 | 344 |

The administrator collection creates fresh A/B accounts plus three bookings, validates administrator management and user denials, and removes only those run bookings. A separate pre-existing historical administrator booking was inserted before all collection runs. A final raw database comparison confirmed it was unchanged and was the only booking remaining. The temporary environment, database process, and HTTP server were removed after execution. Committed variables contain no generated credentials or tokens.

The installed CLI has no `postman status` command (confirmed: unknown command). Local runs succeeded despite a cloud-publication login notice; no login, workspace initialization, or publication was needed or attempted. These are local functional checks; Atlas, production/load behavior, and the final three-second requirement remain unverified. Ticket 09 logout remains pending.
