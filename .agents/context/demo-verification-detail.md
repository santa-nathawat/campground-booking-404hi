# Detailed API demo evidence

Verified on 16 November 2026 using the configured MongoDB Atlas database, a local backend, Node.js 26.12.1, and Postman CLI 1.76.0. All three sequential runs passed: **121 requests and 403 assertions each**, with maximum request times of **319 / 193 / 188 ms**. Every request was checked against the 3000 ms limit, including registration/login and expected error responses.

The [sanitized evidence](../../docs/evidence/demo-atlas-cli.json) records individual requests, timing, assertion counts, failures, machine details, database counts, and preservation checks. Atlas region/tier and physical network conditions could not be independently verified and are marked unverified. The first run followed an application restart and administrator preflight; the Atlas connection was already established. This does not measure an Atlas cold start or concurrent load.

## Run again

Install Node.js 26, npm dependencies, and Postman CLI. Configure the existing local `backend/.env` with `MONGO_URI`, `JWT_SECRET`, and administrator credentials. From `backend/`:

```sh
npm ci
npm run verify:demo
```

The runner builds the backend, checks Atlas connectivity and administrator login, starts its own backend on a free local port, and executes three collections sequentially. It provisions an administrator only if the configured email is absent, and seeds campgrounds only if fewer than three exist. Existing accounts are never promoted or overwritten. Local report files are written under `docs/evidence/`; inspect them before committing. No results are published to Postman cloud. No new npm dependencies are needed.

To run directly against an already-running backend, import `postman/demo.postman_collection.json` and `postman/demo.postman_environment.json`, set administrator credentials locally, and use Runner, or run from the repository root:

```sh
postman collection run postman/demo.postman_collection.json -e /absolute/path/to/private-environment.json --no-report-events
```

The private environment uses the supplied template's `BASE_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` fields. The wrapper adds durable booking tracking, sanitized reports, and automatic recovery cleanup; a direct Runner/CLI run still performs its in-collection cleanup. Clear runtime credentials/tokens before exporting from Postman.

## Data and recovery

Each complete collection creates two ordinary users, one campground, and twenty bookings. The twenty bookings coexist for the administrator dataset check, including overlapping stays and more than three bookings for one user. Dates are generated in the Bangkok calendar. All created bookings are removed; users and campgrounds remain because the public API has no deletion endpoints for them. Existing campgrounds and bookings are preserved. Do not reset the shared database.

The recorded successful CLI series started with 18 users, 9 campgrounds, and 0 bookings, and finished with 24 users, 12 campgrounds, and 0 bookings. Earlier development attempts also left their generated accounts/campgrounds. The two interruption checks left four more users and two campgrounds; [final database counts](../../docs/evidence/final-database-counts.json) are 28 users, 14 campgrounds, and 0 bookings. Administrator setup and seeding were unnecessary for these runs.

The wrapper journals successful booking IDs in ignored `backend/.cache/demo/<run-id>.json`. Ctrl+C finishes the current collection, then cleans up and exits with failure status; it skips subsequent repetitions. This preserves responses from any in-flight writes. After an interrupted or failed cleanup, from `backend/`:

```sh
npm run verify:demo -- --recover .cache/demo/<run-id>.json
```

Recovery verifies the configured database matches the journal, logs in as administrator, and deletes only journaled IDs; already-absent IDs are accepted. Keep the same database configuration for recovery. Journals are local and should be retained until cleanup is confirmed. An abrupt process/machine failure between persistence of a booking and receipt of its response can leave an unjournaled record: inspect that run's generated accounts and confirmed IDs before any manual cleanup; never delete a broad administrator result set. Orphaned `*-environment.json` files after a hard kill contain local administrator credentials; remove those ignored files after recovery.

A real recovery check removed a journaled booking while preserving another booking, then removed the test's remaining booking ([result](../../docs/evidence/recovery-check.json), [runner evidence](../../docs/evidence/demo-recovery.json)). A SIGINT check requested interruption after the first booking, allowed all 121 requests to finish, and confirmed cleanup with exit code 1 ([evidence](../../docs/evidence/demo-interruption.json)).

## Requirement coverage

All entries below passed in each complete CLI run. Detailed edge cases remain covered by the 171 automated tests; type checking and build also passed.

| Requirement | Integrated collection checks |
| --- | --- |
| FR-01 Register | Register A/B; duplicate email; missing telephone; rejected administrator role. |
| FR-02 Login/logout | Administrator/user login; incorrect password; missing/invalid token; logout clears credentials; copied JWT remains valid until expiry. |
| FR-03 Browse/book | Campground list/detail and admin creation; 1/2/3-night bookings; twenty-booking dataset; rejected zero/negative/4-night/past stays. |
| FR-04 Own reads | Own lists/detail; other users' and administrator bookings denied. |
| FR-05 Own edits | Campground/date updates and persisted reads; owner transfer and invalid merged dates rejected; cross-user edits denied. |
| FR-06 Own deletes | Timing-booking cleanup by owner; deleted-booking read returns 404; cross-user deletes denied. |
| FR-07 Admin reads | All run owners visible; administrator reads each owner's booking. |
| FR-08 Admin edits | Campground/date edits for A, B, and administrator; ownership injection and invalid dates rejected. |
| FR-09 Admin deletes | Removes A/B/admin bookings; repeated deletion/read-back and final absence checks. |
| Response time | Each HTTP response is at most 3000 ms; per-request timings retained. |
| Privacy/preservation | Public-field assertions, authorization matrix, database snapshots, and recovery sentinel check. |

## Development failures retained

The initial Newman attempt failed because its sandbox lacked `Intl`; Bangkok date generation now uses a fixed UTC+7 offset ([failure evidence](../../docs/evidence/demo-initial-date-failure.json)). An intermediate corrected Newman run passed ([evidence](../../docs/evidence/demo-newman-intermediate.json)); Newman was subsequently removed so the final implementation adds no dependencies. The first CLI wrapper attempt was interrupted after assertion instrumentation caused sandbox timeouts and wrapped console lines were not parsed ([evidence](../../docs/evidence/demo-cli-wrapper-interrupted.json)). The corrected wrapper uses a local assertion helper and reconstructs wrapped metrics. An initial immediate-termination check exposed an in-flight booking race ([evidence](../../docs/evidence/demo-interruption-race.json)); the leftover booking was confirmed as owned by that run and recovered ([evidence](../../docs/evidence/demo-race-recovery.json)). Graceful signals now finish the current collection before cleanup, and the repeated interruption check passed. These failed/interrupted attempts do not establish timing compliance; the final complete CLI series does.
