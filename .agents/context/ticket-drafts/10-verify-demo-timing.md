# 10: Verify the complete API demo and response times

Status: Complete. Three final Atlas/Postman CLI runs passed 121 requests/403 assertions each; maximum response time 319 ms. Recovery and SIGINT cleanup verified. See [evidence and repeat-run instructions](../../../docs/demo-verification.md). Not published or labeled in an external tracker.

## What to build

The team can run one reproducible API demonstration with full requirement coverage and honest response-time evidence.

## Acceptance criteria

- [x] Assemble the incremental Postman scenarios into a documented Runner/Newman flow covering registration/login/logout, campground reads/admin creation, booking CRUD, duration failures, and user/admin authorization.
- [x] Use an isolated database, two ordinary users, one administrator, and at least three campgrounds. Generate dates at runtime, capture created IDs, and clean up only run-owned records.
- [x] Document repeat runs and interrupted-run recovery without a public database-reset API or destructive reset of shared data.
- [x] Export sanitized collections/environment templates. Keep passwords, live tokens, Atlas connection strings, and secrets out of repository and evidence.
- [x] Assert every measured request is at most 3000 ms, including registration/login. Record runtime/machine, network, Atlas region/tier, data size, request count, cold/repeated timings, and individual failures.
- [x] The proposed starting timing dataset is twenty bookings with sequential requests; record the actual conditions and do not claim untested concurrency or unlimited scale.
- [x] Map requirement IDs to actual checks/results and preserve failures. Feature tests already ship with their feature tickets; this ticket integrates evidence rather than postponing all testing.

## Blocked by

08: Manage all bookings as administrator, 09: Log out and demonstrate JWT limits
