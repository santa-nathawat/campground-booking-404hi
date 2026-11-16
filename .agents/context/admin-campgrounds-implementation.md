# Ticket 03 implementation and evidence

Implemented on `codex/03-admin-create-campgrounds`, locally verified on 2026-11-16 (Asia/Bangkok). Implementation checkpoint: `318a1b2`. No Atlas access or cloud publication was performed.

## Adopted conventions

- `npm run setup:admin` reads explicit `ADMIN_NAME`, `ADMIN_TELEPHONE`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from the environment or ignored local dotenv configuration. It also needs `MONGO_URI`, but no JWT secret or valid HTTP port. No default administrator exists.
- The command shares account validation with registration: trimmed nonempty name/telephone, normalized valid email, password at least 8 characters and at most 72 UTF-8 bytes without trimming. It hashes with bcrypt cost 10 and explicitly stores role `admin`.
- The user chose duplicate rejection: existing ordinary/admin emails fail without account changes. The command initializes the unique email index before inserting, disconnects after success/failure, returns nonzero on failure, and prints sanitized messages without credentials or connection values.
- `POST /api/v1/campgrounds` runs existing Bearer authentication followed by a current-stored-role administrator guard. Authentication failures return 401; ordinary users receive 403 (`Administrator access required`) before campground field validation.
- Strict input accepts only name/address/telephone as trimmed nonempty strings. Missing/invalid/unknown fields return 400 (`Invalid campground fields`). Success returns 201 with `{ success: true, data: { id, name, address, telephone } }`. Persistence uses the existing model and public serializer; existing browsing immediately includes the destination.
- No dependency changes, migrations, public role management, or campground update/delete endpoints were added.

## Checks actually run

Local macOS, Node.js v26.12.1, Postman CLI 1.76.0. MongoDB processes were temporary instances from `mongodb-memory-server`; no configured Atlas database was used.

- `npm run typecheck`: passed for application and tests.
- `npm run build`: passed.
- `npm test`: 98 tests passed across five files, including all 72 existing tests.
- Setup tests execute the actual npm command. They verify normalization, bcrypt cost/password preservation, ordinary HTTP login, campground creation/persistence/list/detail, existing-token denial after demotion, duplicate ordinary/admin account preservation, missing/invalid inputs, unavailable/invalid MongoDB configuration, and sanitized error output. JWT/port settings are deliberately invalid for command execution.
- Campground HTTP tests cover contact trimming, public response fields, missing/blank/non-string fields, unexpected keys, absent/malformed bodies, ordinary-user denial before field validation, and missing/invalid/expired/deleted-account tokens. Denied and invalid requests leave no campground records.
- Built-app Postman verification started `node dist/server.js` on a temporary port, seeded fixtures and provisioned an administrator using the actual commands, then ran all three committed collections with `--no-report-events` against the same isolated database.
- Authentication: 9 requests, 26 assertions, zero failures, exit 0.
- Campground browsing: 11 requests, 40 assertions, zero failures, exit 0.
- Administrator creation: 10 requests, 29 assertions, zero failures, exit 0. Covers unauthenticated denial, rejected public role escalation, ordinary user denial, administrator login, missing/unknown field rejection, successful creation, and ordinary-user list/detail visibility.
- Runtime administrator credentials were generated for verification and supplied through a temporary environment file with owner-only permissions. The file, temporary database, and API process were removed/stopped after execution; no populated environment was exported or committed.
- `git diff --check`: passed before the final documentation commit.
- `postman status` was attempted but CLI 1.76.0 reports that command unsupported. Local collection runs succeeded without signing in; optional cloud login notices did not affect execution.

These are local functional results. Atlas access and the full-project timing/demo requirements remain unverified and assigned to later work.
