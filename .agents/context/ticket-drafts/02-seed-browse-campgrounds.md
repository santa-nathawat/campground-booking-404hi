# 02: Seed and browse campgrounds after login

Status: Implemented and locally verified. See [implementation evidence](../campgrounds-implementation.md). Not published or labeled in an external tracker.

Human summary: [ticket 02](../../../docs/tickets/02-seed-browse-campgrounds.md). This file retains detailed acceptance criteria.

## What to build

A logged-in user can browse real campground records created by a repeatable development/demo seed command.

## Acceptance criteria

- [x] Persist campgrounds with required name, address, and telephone fields. Return destination data without private booking lists.
- [x] Provide authenticated campground listing and the proposed single-campground detail operation; deny unauthenticated access and handle missing/malformed identifiers consistently.
- [x] Provide a documented seed command that adds missing fixture campgrounds using stable identities. Re-running it does not duplicate, overwrite, or delete existing records.
- [x] Ensure seeding never deletes or changes bookings, including unrelated existing documents; use test fixtures where needed before booking creation exists.
- [x] Verify seed behavior through its command and browsing through HTTP against the isolated database. Add Postman browse requests and preserve leading zeroes in telephone data.

## Blocked by

01: Register, log in, and verify identity
