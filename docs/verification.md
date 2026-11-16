# Verification

**Status:** planned checks. No application tests run yet.

## Must pass

- Registration requires all four fields. Duplicate email fails. Password is hashed and never returned.
- Login rejects bad credentials. Protected routes reject missing, invalid, or expired tokens.
- Public registration cannot grant administrator access.
- Campground reads require login. Only administrators can create campgrounds.
- Users see, edit, and delete only their bookings. Administrators can manage anyone's bookings.
- Valid 1-, 2-, and 3-night stays succeed. Zero, negative, 4-night, invalid, and past dates fail.
- Check-in today succeeds in `Asia/Bangkok`. Test month/year boundaries and Thailand midnight.
- Booking updates validate the merged dates. Ownership cannot change.
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

Test runner, dependency versions, commands, and deployment target remain to be selected.
