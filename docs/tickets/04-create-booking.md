# 04: Create a booking

**Status:** Approved; not started.
**Blocked by:** [02](02-seed-browse-campgrounds.md)

Logged-in users can book a campground for 1–3 nights.

## Done when

- [ ] Use an existing campground. Set owner from the authenticated user, never the request body.
- [ ] Use the Thailand calendar (`Asia/Bangkok`). Allow check-in today or later; exclude check-out from the stay.
- [ ] Accept 1-, 2-, and 3-night stays. Reject past, invalid, zero-length, reversed, and longer stays.
- [ ] Allow overlapping bookings and more than three bookings per user.
- [ ] Test persistence and date boundaries through HTTP. Use clock-controlled tests for Thailand midnight and month/year changes.
- [ ] Add Postman success and invalid-duration examples. Document the chosen date representation.
