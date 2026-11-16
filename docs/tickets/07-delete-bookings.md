# 07: Delete a booking

**Status:** Approved; not started.
**Blocked by:** [04](04-create-booking.md)

Owners can delete their bookings, including past stays.

## Done when

- [ ] Remove the booking from the database. Do not add soft deletion or cancellation states.
- [ ] Deny unauthenticated and cross-user deletion. Denied requests must leave the booking unchanged.
- [ ] Handle missing records and malformed IDs consistently.
- [ ] Test removal and denied access through HTTP and Postman. Administrator deletion comes in ticket 08.
