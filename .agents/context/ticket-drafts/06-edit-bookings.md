# 06: Edit a booking without changing its owner

Status: Plan approved; not started. Not published or labeled in an external tracker.

Human summary: [ticket 06](../../../docs/tickets/06-edit-bookings.md). This file retains detailed acceptance criteria.

## What to build

A booking owner can change their campground or dates while ownership and stay rules remain enforced.

## Acceptance criteria

- [ ] Allow a nonempty update of campground and/or dates only; reject ownership changes, authority fields, and unexpected input.
- [ ] Validate the resulting complete date pair when either date changes. A partial update cannot bypass today-or-later or one-to-three-night validation.
- [ ] Changing campground requires an existing destination. Preserve the fixed owner and persisted state after rejected updates.
- [ ] Deny ordinary-user edits to another user's booking and unauthenticated edits.
- [ ] Keep the historical-booking edge case explicit: campground-only edits preserving past dates are a documented proposal to resolve when finalizing this operation; do not silently convert it into an earlier agreed requirement.
- [ ] Add HTTP tests for allowed, denied, invalid, and merged updates, plus focused calendar tests as needed. Add matching Postman update requests. Administrator-wide editing is ticket 08.

## Blocked by

04: Create an owned one-to-three-night booking
