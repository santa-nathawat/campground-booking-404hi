# 02: Seed and browse campgrounds

**Status:** Implemented; locally verified. See [verification](../verification.md).
**Blocked by:** [01](01-register-login.md)

Logged-in users can browse campgrounds prepared by a repeatable seed command.

## Done when

- [x] Store and return each campground's name, address, and telephone. Preserve leading zeroes in telephone numbers.
- [x] Require login for campground lists and details. Never include private bookings.
- [x] Seed missing demo campgrounds. Re-running seed must not duplicate, overwrite, or delete existing records.
- [x] Preserve all bookings during seeding.
- [x] Test the seed command and HTTP browsing, including denied access and missing records. Add Postman requests.
