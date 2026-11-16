# 08: Manage bookings as administrator

**Status:** Implemented and locally verified.
**Blocked by:** [03](03-admin-create-campgrounds.md), [05](05-read-bookings.md), [06](06-edit-bookings.md), [07](07-delete-bookings.md)

Administrators can manage anyone's bookings without weakening ordinary-user privacy.

## Done when

- [x] List and inspect bookings from all users.
- [x] Edit campground/dates or delete any booking. Keep its owner fixed.
- [x] Apply the same date and duration rules to administrator edits and personal bookings.
- [x] Administrators create bookings for themselves only, not on behalf of other users.
- [x] Preserve ordinary users' own-only access and deny unauthenticated requests.
- [x] Test the user A/user B/administrator access matrix through HTTP. Add matching Postman scenarios.

Verification: [ticket 08 evidence](../../.agents/context/admin-bookings-implementation.md).
