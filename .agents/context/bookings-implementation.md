# Booking implementation

## Ticket 04

The booking model stores owner/campground ObjectIds and check-in/check-out as validated `YYYY-MM-DD` strings. POST `/api/v1/bookings` accepts exactly `campgroundId`, `checkIn`, and `checkOut`, derives owner from the authenticated current account, and returns 201 with `{ success: true, data: { id, ownerId, campground, checkIn, checkOut } }`. Campground uses the existing public four-field representation. No owner accounts are populated.

Dates must be real Gregorian dates (years 0001–9999). Today is determined in Asia/Bangkok; calendar-day arithmetic uses UTC midnight coordinates, not elapsed local hours. Check-in today or later and 1–3 nights are required. Overlaps and more than three bookings are allowed. Invalid fields/dates/IDs return 400; missing campground returns 404; authentication runs first.

Tests use Vitest/Supertest with isolated MongoDB. Date-only fake clocks cover Thailand midnight, month/year boundaries, leap years, invalid dates, ownership injection, persistence, overlaps/counts, and administrator self-booking. Verification results are recorded after execution; no Atlas performance claim is made.

Ticket 04 checkpoint: type checking and all 30 booking tests pass. The boundary test caught unpadded Intl years in the synthetic early-year clock; padding the year fixes date-only lexical ordering. The creation Postman collection is added; execution is pending the complete lifecycle collection.

## Ticket 05

GET `/bookings` returns the caller's records ordered by `_id` ascending, with `count`; empty lists return `[]`. GET `/bookings/:id` returns one authorized public booking. Both include public campground details using Mongoose population; listing batches the destination query. Historical records remain readable. Malformed IDs return 400 (`Invalid booking identifier`), missing records 404 (`Booking not found`), and cross-user access 403 (`Booking access denied`). Authentication runs before ID validation. Administrators remain own-only until ticket 08, as explicitly selected by the user.

HTTP tests verify both users' isolation, public-field serialization even with unexpected stored fields, historical reads, ordering, ID conventions, authentication, and administrator own-only access. Postman now includes two overlapping bookings, both own-only lists, detail, cross-user denial, and unauthenticated/malformed-ID failures.
