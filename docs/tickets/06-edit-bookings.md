# 06: Edit a booking

**Status:** Implemented and locally verified. See [verification](../verification.md).
**Blocked by:** [04](04-create-booking.md)

Owners can change a booking's campground or dates while ownership stays fixed.

## Done when

- [x] Allow a nonempty update of campground and/or dates. Reject ownership changes and unexpected fields.
- [x] On every update, validate the complete resulting stay: check-in today or later and 1–3 nights.
- [x] Require an existing campground. Failed updates must preserve the original booking.
- [x] Deny unauthenticated and cross-user edits.
- [x] Validate the entire resulting stay on every edit; reject campground-only historical edits. A historical booking may be rescheduled to valid current/future dates.
- [x] Test allowed, denied, invalid, and partial updates through HTTP and Postman. Administrator editing comes in ticket 08.
