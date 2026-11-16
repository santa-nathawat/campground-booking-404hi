# 04: Create a booking

**Status:** Implemented and locally verified. See [verification](../verification.md).
**Blocked by:** [02](02-seed-browse-campgrounds.md)

Logged-in users can book a campground for 1–3 nights.

## Done when

- [x] Use an existing campground. Set owner from the authenticated user, never the request body.
- [x] Use the Thailand calendar (`Asia/Bangkok`). Allow check-in today or later; exclude check-out from the stay.
- [x] Accept 1-, 2-, and 3-night stays. Reject past, invalid, zero-length, reversed, and longer stays.
- [x] Allow overlapping bookings and more than three bookings per user.
- [x] Test persistence and date boundaries through HTTP. Use clock-controlled tests for Thailand midnight and month/year changes.
- [x] Add Postman success and invalid-duration examples. Document the chosen date representation.
