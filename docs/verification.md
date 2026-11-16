# Verification

**Status:** Tickets 01–07 pass 150 automated tests and four local Postman collections (59 requests/170 assertions total, including bookings: 29/75), with zero failures. Type checking and build pass. Administrator access to others’ bookings (08), logout (09), Atlas, and full-project timing checks remain pending. See [booking evidence](../.agents/context/bookings-implementation.md).

Run `npm run typecheck`, `npm run build`, and `npm test` from `backend/`. See the [Postman instructions](../postman/README.md) for HTTP requests.

## Must pass

- Registration requires all four fields. Duplicate email fails. Password is hashed and never returned.
- Login rejects bad credentials. Protected routes reject missing, invalid, or expired tokens.
- Public registration cannot grant administrator access.
- Campground reads require login. Only administrators can create campgrounds.
- Users see, edit, and delete only their bookings. Administrators can manage anyone's bookings.
- Valid 1-, 2-, and 3-night stays succeed. Zero, negative, 4-night, invalid, and past dates fail.
- Check-in today succeeds in `Asia/Bangkok`. Test month/year boundaries and Thailand midnight.
- Every booking update validates the merged dates, including campground-only edits. Ownership cannot change.
- Administrators' own bookings obey the same rules.
- Overlapping bookings and more than three bookings per user succeed.
- Logout clears client credentials. Document that copied JWTs remain valid until expiry.
- Re-running seed adds no duplicate fixtures and preserves existing campgrounds/bookings.

## Demo and timing

Use Postman Runner or Newman with one administrator, two users, and at least three campgrounds.
Generate dates at runtime. Save created IDs and clean up only the run's bookings.
Keep live credentials and tokens out of exported files.

Proposed timing run: local backend, Atlas test database, 20 bookings, sequential requests.
Every request must finish within 3000 ms, including registration/login.
Record machine, network, Atlas region/tier, dataset, request count, and cold/repeated timings.
Report individual failures. Do not claim results for untested load.

## Build order

1. Backend skeleton, configuration, database connection, error handling.
2. Authentication, roles, administrator setup.
3. Campgrounds, admin POST, repeatable seed.
4. Bookings, ownership, date rules, module tests.
5. Postman collection and timing evidence.
6. Baseline comparison, diagrams, contributors, presentation, live demo.

Authentication/campground HTTP tests use Vitest/Supertest with isolated MongoDB; seed tests execute `npm run seed:campgrounds` directly against a separate temporary database. They verify repeat runs, partial restoration, edited/unrelated campground preservation, and unchanged raw bookings. Detailed [ticket 02 evidence](../.agents/context/campgrounds-implementation.md) records local conditions. Versions are locked in `backend/package-lock.json`. Deployment remains undecided. No Atlas timing claim is made.

Administrator tests execute `npm run setup:admin` directly against isolated MongoDB, then log in and create/browse through HTTP. They cover invalid/missing inputs, hashed passwords, duplicate ordinary/admin email preservation, database failures, and sanitized errors. Campground POST tests cover validation, denied access, persistence, and current stored roles. See [ticket 03 evidence](../.agents/context/admin-campgrounds-implementation.md).

Booking HTTP tests cover creation/persistence, both users’ privacy, strict fields, all stay durations and calendar boundaries, merged updates, rejected historical edits and valid rescheduling, and permanent deletion. Postman verifies the owned lifecycle against the built local API; these runs do not establish Atlas timing compliance.
