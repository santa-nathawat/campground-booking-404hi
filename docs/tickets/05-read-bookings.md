# 05: Read own bookings

**Status:** Approved; not started.
**Blocked by:** [04](04-create-booking.md)

Users can list and inspect their own bookings without exposing another user's records.

## Done when

- [ ] Return the caller's bookings with campground and date details.
- [ ] Deny unauthenticated access and direct access to another user's booking.
- [ ] Handle empty lists, missing records, and malformed IDs consistently.
- [ ] Keep past bookings visible. Exclude passwords and unrelated records.
- [ ] Test with two users through HTTP and Postman. Administrator-wide access comes in ticket 08.
