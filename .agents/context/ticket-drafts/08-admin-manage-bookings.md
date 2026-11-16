# 08: Manage all bookings as administrator

Status: Plan approved; not started. Not published or labeled in an external tracker.

Human summary: [ticket 08](../../../docs/tickets/08-admin-manage-bookings.md). This file retains detailed acceptance criteria.

## What to build

An administrator can list, inspect, edit, and delete any user's booking while ordinary-user privacy remains intact.

## Acceptance criteria

- [ ] Administrator listing includes bookings belonging to users A and B; administrator detail access can inspect either booking.
- [ ] Administrators may change another user's campground/dates or delete their booking; ownership remains fixed.
- [ ] Apply identical date and duration rules to administrator edits and personal booking creation. Administrators cannot create bookings on behalf of arbitrary users.
- [ ] Preserve ordinary users' own-only list/detail/update/delete behavior and deny unauthenticated operations.
- [ ] Use current authorized identity/role according to the finalized authentication contract; no special fallback credentials or client-selected role bypass.
- [ ] Add HTTP tests covering the full user A/user B/administrator access matrix and administrator personal bookings. Extend Postman scenarios accordingly.

## Blocked by

03: Provision an administrator and create campgrounds, 05: Read only authorized bookings, 06: Edit a booking without changing its owner, 07: Delete an owned booking
