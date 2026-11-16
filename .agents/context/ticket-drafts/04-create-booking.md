# 04: Create an owned one-to-three-night booking

Status: Implemented and locally verified. See [booking evidence](../bookings-implementation.md). Not published or labeled in an external tracker.

Human summary: [ticket 04](../../../docs/tickets/04-create-booking.md). This file retains detailed acceptance criteria.

## What to build

A logged-in user can create a persisted campground booking for one to three nights under their own identity.

## Acceptance criteria

- [x] Reference an existing campground and the authenticated owner. Reject or safely exclude body-supplied ownership and unexpected authority fields.
- [x] Use check-in/check-out dates in the Asia/Bangkok calendar. Today is allowed; past check-in, nonexistent/malformed dates, zero/negative duration, and more than three nights fail.
- [x] Check-out is excluded from nights; one-, two-, and three-night stays succeed. Validate month/year boundaries and Thailand midnight using controlled-clock tests where useful.
- [x] Allow overlapping dates at the same campground and more than three separate valid bookings per user. Remove inherited appointment-count restrictions.
- [x] Confirm persisted owner, campground, and date range through HTTP test outcomes and database-backed test evidence without requiring an unfinished list endpoint.
- [x] Document finalized date representation and creation contract. Add HTTP tests and Postman booking creation/invalid-duration requests; keep booking tests with the module.

## Blocked by

02: Seed and browse campgrounds after login
