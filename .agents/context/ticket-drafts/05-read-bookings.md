# 05: Read only authorized bookings

Status: Plan approved; not started. Not published or labeled in an external tracker.

Human summary: [ticket 05](../../../docs/tickets/05-read-bookings.md). This file retains detailed acceptance criteria.

## What to build

An ordinary user can list and inspect their own bookings without exposing another user's records.

## Acceptance criteria

- [ ] Provide own-only booking listing and single-booking detail with useful destination/date information.
- [ ] With users A and B, each list excludes the other user's bookings; direct access to another user's booking is denied.
- [ ] Unauthenticated access fails. Empty lists, missing resources, and malformed IDs use documented response conventions.
- [ ] Keep passwords and unrelated records out of every response. Historical bookings remain viewable.
- [ ] Add HTTP integration tests with both users and sanitized Postman list/detail/cross-user-denial scenarios. Administrator-wide access is added by ticket 08.

## Blocked by

04: Create an owned one-to-three-night booking
