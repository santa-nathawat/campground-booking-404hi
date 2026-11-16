# 05: Read own bookings

**Status:** Implemented and locally verified. See [verification](../verification.md).
**Blocked by:** [04](04-create-booking.md)

Users can list and inspect their own bookings without exposing another user's records.

## Done when

- [x] Return the caller's bookings with campground and date details.
- [x] Deny unauthenticated access and direct access to another user's booking.
- [x] Handle empty lists, missing records, and malformed IDs consistently.
- [x] Keep past bookings visible. Exclude passwords and unrelated records.
- [x] Test with two users through HTTP and Postman. Administrator-wide access comes in ticket 08.
