# 06: Edit a booking without changing its owner

Status: Implemented and locally verified. See [booking evidence](../bookings-implementation.md). Not published or labeled in an external tracker.

Human summary: [ticket 06](../../../docs/tickets/06-edit-bookings.md). This file retains detailed acceptance criteria.

## What to build

A booking owner can change their campground or dates while ownership and stay rules remain enforced.

## Acceptance criteria

- [x] Allow a nonempty update of campground and/or dates only; reject ownership changes, authority fields, and unexpected input.
- [x] Validate the resulting complete date pair on every update. A partial update cannot bypass today-or-later or one-to-three-night validation.
- [x] Changing campground requires an existing destination. Preserve the fixed owner and persisted state after rejected updates.
- [x] Deny ordinary-user edits to another user's booking and unauthenticated edits.
- [x] User decision during implementation planning: validate the entire resulting stay on every update, including campground-only edits. Historical bookings may be rescheduled to valid current/future dates; unchanged past dates cause rejection.
- [x] Add HTTP tests for allowed, denied, invalid, and merged updates, plus focused calendar tests as needed. Add matching Postman update requests. Administrator-wide editing is ticket 08.

## Blocked by

04: Create an owned one-to-three-night booking
