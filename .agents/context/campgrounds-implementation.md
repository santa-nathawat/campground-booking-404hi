# Ticket 02 implementation and evidence

Implemented on `codex/02-seed-browse-campgrounds`, locally verified on 2026-11-16 (Asia/Bangkok). Implementation checkpoint: `e42047b`. No external ticket publication, Git push, Atlas access, or cloud Postman publication was performed.

## Adopted conventions

- The campground module follows the existing routes/controller/service/model organization and uses the shared Bearer authentication and error middleware.
- Campgrounds require trimmed, nonempty name, address, and telephone strings. Public serializers allow only `id`, `name`, `address`, and `telephone`, including when underlying documents contain unexpected/private fields.
- `GET /api/v1/campgrounds` returns `{ success: true, count, data: [...] }`, ordered by `_id` ascending. Empty data is `[]` with count zero. No pagination or filter language is introduced.
- `GET /api/v1/campgrounds/:id` returns `{ success: true, data: <public campground> }`. Authentication precedes validation. A non-24-hex ID returns 400 (`Invalid campground identifier`); an absent valid ID returns 404 (`Campground not found`). Both users and administrators may browse.
- `npm run seed:campgrounds` from `backend/` loads dotenv and validates only `MONGO_URI`; it needs no JWT secret or valid HTTP port. Existing server configuration requirements remain unchanged. Completion reports inserted/existing counts, closes MongoDB, and failures exit 1 with a sanitized message.
- The approved fixtures are fictional, explicitly named Demo Pine Grove, Demo Riverside, and Demo Hilltop, with sample addresses/telephone strings. They are persisted MongoDB records, not hardcoded HTTP results. Stable IDs are `cafe00000000000000000001` through `cafe00000000000000000003`.
- Each seed update matches a fixture `_id` and uses `$setOnInsert` with upsert/validation. Existing identities are preserved even after local edits. A different ID with the same name is an unrelated record and remains intact. The script has no booking collection operations and performs no reset or deletion.
- Administrator campground creation and booking APIs remain assigned to their later tickets. No new dependencies or migrations were needed.

## Checks actually run

Local macOS host, Node.js v26.12.1. Tests used real temporary MongoDB processes supplied by the existing `mongodb-memory-server` dependency, with no configured Atlas database.

- Baseline before implementation: type checking and all 50 existing tests passed.
- `npm run typecheck`: passed for application and test sources.
- `npm run build`: passed.
- `npm test`: 72 tests passed across four files (50 existing and 22 new).
- Campground HTTP tests cover required fields, contact trimming/string telephone preservation, empty/populated lists, deterministic ordering, explicit public fields despite private raw-document fields, detail, current administrator access, malformed/missing IDs, missing/invalid/expired tokens, authentication before ID validation, and deleted accounts.
- Seed tests spawn the actual `npm run seed:campgrounds` command against a separate temporary database. They verify first/repeated runs, raw document equality, restoration of only a missing fixture, preservation of edited fixtures and unrelated same-name records, and unchanged raw bookings referencing seeded, missing, and unrelated destinations plus an arbitrary unrelated document. Invalid/missing database configuration and inaccessible MongoDB exit 1 without disclosing connection values. JWT/HTTP settings are deliberately invalid to prove they are not seed prerequisites.
- Built-app Postman verification launched `node dist/server.js` on a temporary local port, seeded three fixtures through the command, and ran both committed collections sequentially with the environment template, a runtime `BASE_URL` override, and `--no-report-events`.
- Authentication Postman collection: 9 requests, 26 assertions, zero failures, exit 0.
- Campground Postman collection: 11 requests, 40 assertions, zero failures, exit 0. Covers registration/login, list/detail and field privacy, leading telephone zero, missing/invalid tokens on both routes, malformed/missing IDs, and authentication before ID validation.
- The API process and temporary database were stopped after the run. No populated environment or collection was exported.
- `postman status` was attempted; this installed CLI does not support that command. It also printed optional login notices during local collection execution; both runs still completed successfully without login or cloud publication.

The browse collection creates a fresh ordinary user and expects seeded fixtures; the command intentionally preserves local edits, so use a fresh isolated database for reproducible fixture assertions. No full-project or Atlas response-time claim follows from these local functional checks. Timing/demo evidence remains ticket 10 work.
