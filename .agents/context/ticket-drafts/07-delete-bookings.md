# 07: Delete an owned booking

Status: Implemented and locally verified. See [booking evidence](../bookings-implementation.md). Not published or labeled in an external tracker.

Human summary: [ticket 07](../../../docs/tickets/07-delete-bookings.md). This file retains detailed acceptance criteria.

## What to build

A booking owner can remove their booking while other ordinary users cannot delete it.

## Acceptance criteria

- [x] Delete the persisted booking for its authenticated owner, including a historical booking.
- [x] Deny unauthenticated and cross-user deletion. Failed access must preserve the booking.
- [x] Return documented success and missing/malformed-resource responses. Do not introduce a soft-delete or cancellation-status workflow.
- [x] Add HTTP tests for owner success, denial, missing resources, and persisted removal. Add sanitized Postman deletion and cross-user-denial requests. Administrator-wide deletion is ticket 08.

## Blocked by

04: Create an owned one-to-three-night booking
