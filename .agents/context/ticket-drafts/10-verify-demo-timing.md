# 10: Verify the complete API demo and response times

Status: Plan approved; not started. Not published or labeled in an external tracker.

## What to build

The team can run one reproducible API demonstration with full requirement coverage and honest response-time evidence.

## Acceptance criteria

- [ ] Assemble the incremental Postman scenarios into a documented Runner/Newman flow covering registration/login/logout, campground reads/admin creation, booking CRUD, duration failures, and user/admin authorization.
- [ ] Use an isolated database, two ordinary users, one administrator, and at least three campgrounds. Generate dates at runtime, capture created IDs, and clean up only run-owned records.
- [ ] Document repeat runs and interrupted-run recovery without a public database-reset API or destructive reset of shared data.
- [ ] Export sanitized collections/environment templates. Keep passwords, live tokens, Atlas connection strings, and secrets out of repository and evidence.
- [ ] Assert every measured request is at most 3000 ms, including registration/login. Record runtime/machine, network, Atlas region/tier, data size, request count, cold/repeated timings, and individual failures.
- [ ] The proposed starting timing dataset is twenty bookings with sequential requests; record the actual conditions and do not claim untested concurrency or unlimited scale.
- [ ] Map requirement IDs to actual checks/results and preserve failures. Feature tests already ship with their feature tickets; this ticket integrates evidence rather than postponing all testing.

## Blocked by

08: Manage all bookings as administrator, 09: Log out and demonstrate JWT limits
