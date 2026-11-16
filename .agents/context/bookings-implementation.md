# Booking implementation

## Ticket 04

The booking model stores owner/campground ObjectIds and check-in/check-out as validated `YYYY-MM-DD` strings. POST `/api/v1/bookings` accepts exactly `campgroundId`, `checkIn`, and `checkOut`, derives owner from the authenticated current account, and returns 201 with `{ success: true, data: { id, ownerId, campground, checkIn, checkOut } }`. Campground uses the existing public four-field representation. No owner accounts are populated.

Dates must be real Gregorian dates (years 0001–9999). Today is determined in Asia/Bangkok; calendar-day arithmetic uses UTC midnight coordinates, not elapsed local hours. Check-in today or later and 1–3 nights are required. Overlaps and more than three bookings are allowed. Invalid fields/dates/IDs return 400; missing campground returns 404; authentication runs first.

Tests use Vitest/Supertest with isolated MongoDB. Date-only fake clocks cover Thailand midnight, month/year boundaries, leap years, invalid dates, ownership injection, persistence, overlaps/counts, and administrator self-booking. Verification results are recorded after execution; no Atlas performance claim is made.

Ticket 04 checkpoint: type checking and all 30 booking tests pass. The boundary test caught unpadded Intl years in the synthetic early-year clock; padding the year fixes date-only lexical ordering. The creation Postman collection is added; execution is pending the complete lifecycle collection.

## Ticket 05

GET `/bookings` returns the caller's records ordered by `_id` ascending, with `count`; empty lists return `[]`. GET `/bookings/:id` returns one authorized public booking. Both include public campground details using Mongoose population; listing batches the destination query. Historical records remain readable. Malformed IDs return 400 (`Invalid booking identifier`), missing records 404 (`Booking not found`), and cross-user access 403 (`Booking access denied`). Authentication runs before ID validation. Administrators remain own-only until ticket 08, as explicitly selected by the user.

HTTP tests verify both users' isolation, public-field serialization even with unexpected stored fields, historical reads, ordering, ID conventions, authentication, and administrator own-only access. Postman now includes two overlapping bookings, both own-only lists, detail, cross-user denial, and unauthenticated/malformed-ID failures.

## Ticket 06

PUT accepts a nonempty subset of the three creation fields. Load and authorize the booking before parsing the update, merge with stored values, validate the complete stay, and confirm the destination exists. Write the complete validated tuple atomically with an owner-scoped update; owner never changes. A concurrent deletion yields 404. Concurrent authorized edits use last-write-wins semantics for the complete valid tuple.

The user explicitly rejected the earlier proposal allowing campground-only historical edits: every update requires a valid current/future resulting stay. Historical records can be rescheduled with valid dates. Updated requirements, architecture, contract, verification guidance, and ticket text reflect this decision; earlier kickoff proposals are historical context.

HTTP tests cover campground-only, individual-date, and combined updates, date boundaries, invalid merged stays, nonexistent destinations, strict fields, ownership and authentication precedence, administrator own-only behavior, unchanged state after failure, historical rejection, and successful rescheduling. Postman includes denied edits, ownership-transfer and merged-duration failures, destination/date updates, and a persisted read-back.

## Ticket 07

DELETE permanently removes the authorized owner's record using an owner-scoped delete. It also works for historical bookings without validating dates or populating the destination. Return 200 with empty `data`; a missing record, including repeated deletion, returns 404. Authentication/ID/ownership errors follow reads. HTTP tests verify persisted removal, preservation of unrelated records, historical deletion, denied user/admin access, and empty-list/detail behavior after removal.

## Final verification — 2026-11-16 (Asia/Bangkok)

- Runtime: Node.js 26.12.1, npm 11.20.0, macOS; locked project dependencies.
- `npm run typecheck`: passed for application and test code.
- `npm run build`: passed.
- `npm test`: 150 tests passed across six files; 52 booking tests are colocated in the new module. Temporary MongoDB processes/databases are isolated from `.env` and Atlas.
- Built API bound to a random localhost port with MongoMemoryServer and three campground fixtures. An ephemeral administrator was provisioned directly in the disposable database for the existing administrator collection. Postman CLI ran local collections sequentially with `--no-report-events`; each exited 0 with zero failures:

| Collection | Requests | Assertions |
| --- | ---: | ---: |
| Authentication | 9 | 26 |
| Campground browsing | 11 | 40 |
| Administrator campground creation | 10 | 29 |
| Booking lifecycle | 29 | 75 |
| Total | 59 | 170 |

The booking run creates two fresh ordinary accounts, tests owned creation and invalid requests, verifies both list scopes and cross-user denials, updates and reads back persisted state, deletes only its two bookings, and confirms empty lists. A direct database count after all collections confirmed no bookings remained. The temporary environment, database process, and HTTP server were cleaned up. Committed collection/environment files contain no generated credentials or tokens.

The installed Postman CLI supports local collection runs but has no `status` command. No Postman workspace initialization or cloud publication was needed. The CLI printed a cloud-login notice despite local runs succeeding; no login or publication was attempted. No Atlas, production, load, or final three-second requirement evidence is claimed by these local functional checks.

Tickets 04–07 use sequential local branches, each based on the previous ticket's completed checkpoint commits. Ticket 08 administrator access and ticket 09 logout remain unimplemented. Broader administrator behavior in project requirements is future scope, not enabled by these tickets.
