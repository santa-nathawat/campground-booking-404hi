# API demo verification

**Passed on 16 November 2026:** three Atlas runs, each with 121 requests and 403 assertions.

| Check | Result |
| --- | --- |
| Slowest request | **319 ms** (limit: 3000 ms) |
| Automated tests | **171 passed** |
| Type checking and build | Passed |
| Recovery and interrupted-run cleanup | Passed |

Tests cover registration/login/logout, campground browsing and creation, booking CRUD, invalid dates, and user/admin permissions.

Timing used a local backend and sequential requests to Atlas. Atlas cold starts and concurrent load were not tested; region/tier and physical network conditions remain unverified.

## Run the demo

Requires Node.js 26 and Postman CLI. Configure database, JWT, and administrator settings in local `backend/.env`. From `backend/`:

```sh
npm ci
npm run verify:demo
```

This builds and starts the backend, runs the collection three times, and saves local reports in `docs/evidence/`. Nothing is published to Postman cloud.

Each collection creates **2 users, 1 campground, and 20 bookings**. Bookings are cleaned up; generated users and campgrounds remain. Existing records are preserved.

## Stop or recover

Ctrl+C finishes the current collection, cleans up, and skips remaining runs.

If cleanup fails, keep the same database configuration and run from `backend/`:

```sh
npm run verify:demo -- --recover .cache/demo/<run-id>.json
```

Recovery removes only journaled booking IDs. Keep the journal until cleanup succeeds. A hard crash may leave unjournaled bookings and local `*-environment.json` files containing credentials; inspect run-owned records and remove those local credential files after recovery. Never reset the shared database.

## Evidence

- [Final Atlas results](evidence/demo-atlas-cli.json)
- [Recovery check](evidence/recovery-check.json) and [interruption check](evidence/demo-interruption.json)
- [Final database counts](evidence/final-database-counts.json): 28 users, 14 campgrounds, **0 bookings** at verification time.
- [Detailed requirement mapping, direct Postman instructions, and development history](../.agents/context/demo-verification-detail.md)
