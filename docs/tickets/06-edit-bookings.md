# 06: Edit a booking

**Status:** Approved; not started.
**Blocked by:** [04](04-create-booking.md)

Owners can change a booking's campground or dates while ownership stays fixed.

## Done when

- [ ] Allow a nonempty update of campground and/or dates. Reject ownership changes and unexpected fields.
- [ ] When either date changes, validate the complete resulting stay: check-in today or later and 1–3 nights.
- [ ] Require an existing campground. Failed updates must preserve the original booking.
- [ ] Deny unauthenticated and cross-user edits.
- [ ] Validate the entire resulting stay on every edit; reject campground-only historical edits. A historical booking may be rescheduled to valid current/future dates.
- [ ] Test allowed, denied, invalid, and partial updates through HTTP and Postman. Administrator editing comes in ticket 08.
