# 07: Delete a booking

**Status:** Implemented and locally verified. See [verification](../verification.md).
**Blocked by:** [04](04-create-booking.md)

Owners can delete their bookings, including past stays.

## Done when

- [x] Remove the booking from the database. Do not add soft deletion or cancellation states.
- [x] Deny unauthenticated and cross-user deletion. Denied requests must leave the booking unchanged.
- [x] Handle missing records and malformed IDs consistently.
- [x] Test removal and denied access through HTTP and Postman. Administrator deletion comes in ticket 08.
