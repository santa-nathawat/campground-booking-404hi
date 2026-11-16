# Ticket 01 implementation and evidence

Implemented on `codex/01-register-login`, locally verified on 2026-11-16 (Asia/Bangkok). No external ticket publication or Git push was performed.

## Adopted conventions

These are implementation choices confirmed in the ticket plan, not retroactive claims about the original course requirements:

- Node.js 26, npm, strict TypeScript/NodeNext ESM, Express 5, Mongoose, Zod, bcryptjs, and jsonwebtoken. Exact dependency versions are locked in `backend/package-lock.json`.
- Configuration: required `MONGO_URI` and `JWT_SECRET` (at least 32 UTF-8 bytes); integer `PORT` from 1–65535, default 5000. Dotenv reads `backend/.env` when commands run from `backend/`. Server startup waits for MongoDB and the unique user-email index before listening; failure exits without printing credentials or connection strings.
- Registration accepts only string `name`, `telephone`, `email`, and `password`. Contact fields are trimmed, email lowercased and shape-validated, and telephone remains a nonempty string. Passwords are unchanged, at least eight characters and at most 72 UTF-8 bytes (bcrypt's input limit). Extra fields, including role, are rejected.
- Login accepts only email/password and normalizes email the same way. Missing/malformed input returns 400; incorrect credentials return 401.
- Passwords use salted bcrypt with cost 10 and are stored as `passwordHash`. Normal model queries exclude hashes; public serializers explicitly allow only `id`, `name`, `telephone`, `email`, and `role`.
- Public registration writes role `user`. A unique normalized-email index handles both sequential and concurrent duplicate registrations with 409.
- JWTs use HS256, a one-hour expiry, and the account ID in `sub`. Bearer middleware verifies signature, algorithm, expiry, and account-ID shape, then reads the current stored account. Roles are not trusted from token claims. Missing/deleted accounts return 401. No fallback signing secret or administrator exists. No cookies are issued or accepted.
- Register/login return `{ success: true, data: <public user>, token }`; current user returns `{ success: true, data: <public user> }`. Errors use `{ success: false, message }`. Unexpected failures return a generic 500. Invalid JSON returns 400, oversized bodies 413, and unknown routes 404.
- Vitest/Supertest HTTP tests live beside their module. A dedicated `mongodb-memory-server` process provides real MongoDB, isolated from configured Atlas data. Configuration/startup tests are beside configuration code.

Administrator setup belongs to ticket 03; logout belongs to ticket 09. No campground, booking, or setup-script placeholder code is added.

## Assignment 7 adaptation map

Immutable source: `2110503-69CP/503cp69-a7-2-santa-nathawat`, `server.js` at `fd409c2e38691f7adc8beb81a7767510fe3b4ade`. The file was read through authenticated GitHub access. Baseline tests were not run.

This is a TypeScript/ESM reorganization and adaptation of the actual baseline authentication flow, not a claim of shared Git ancestry or an unmodified copy.

| Requirement | Baseline behavior in `server.js` | Result and verification |
| --- | --- | --- |
| FR-01 | Registration checks name/email/password, hashes with bcrypt cost 10, creates user, and signs token | Auth controller/service and user model retain the flow; add telephone, strict validation, normalized unique email, explicit ordinary role, and public-user responses. Registration HTTP tests cover persisted fields, hashing, duplicates, concurrency, and escalation. |
| FR-02 login | Stored-user lookup and bcrypt comparison, plus fallback administrator credentials | Auth service retains lookup/comparison and removes fallback credentials. Login tests cover correct, incorrect, unknown, and former fallback credentials. |
| Supporting identity check | Protection trusts decoded JWT identity/role; signing has a fallback secret | Shared auth middleware/service require configured signing secret, restricted algorithm and expiry, then load the current user. `/me` tests cover token failures, deleted accounts, current profile, and current role. |
| Runnable backend | CommonJS monolith may listen without a database | `backend/src/app.ts`, `server.ts`, and config separate HTTP assembly/startup, validate environment, await MongoDB/index creation, and handle errors safely. Startup tests and production smoke cover behavior. |

Implementation commits: `64bfc25` establishes the backend; `3a8cf05` implements authentication; `70a3241` adds HTTP/configuration tests. Use the branch diff for subsequent documentation and Postman artifacts.

## Checks actually run

Local macOS host, Node.js v26.12.1, npm 11.20.0, real temporary MongoDB 8.2.6. No team Atlas URI was used or verified.

- `npm ci`: passed from the committed lockfile; npm audit reported zero vulnerabilities.
- `npm run typecheck`: passed for application and test sources.
- `npm run build`: passed; production JavaScript is generated in ignored `backend/dist/`.
- `npm test`: 50 tests passed across authentication and configuration suites. Includes real HTTP/persistence, concurrent duplicate registration, password boundaries/confidentiality, account/role changes, malformed JSON, token checks, generic persistence errors, missing configuration, and inaccessible MongoDB startup failure.
- Production entry-point smoke: launched `node dist/server.js` with a temporary MongoDB URI and ephemeral credentials; registration returned 201, `/me` returned 200, the email index was unique, and SIGTERM closed the server/database connection.
- Postman CLI 1.76.0 ran the committed collection against the built Express app listening on a temporary port with its own temporary MongoDB database: 9 requests, 26 assertions, zero failures, exit 0. Command used the environment template, a local `BASE_URL` override, and `--no-report-events`. No workspace was initialized or cloud results published. The CLI printed optional login/update notices; local execution succeeded without them. `postman status` is unsupported by this installed version.
- Project-kickoff skill validation passed using the skill-creator validator in a temporary Python environment with PyYAML. Its installed `SKILL.md` is outside this repository and is not included in project commits.

The Postman collection creates a fresh ordinary user per run and leaves existing accounts intact. Empty exported values and runtime-generated credentials keep committed artifacts sanitized. No response-time/NFR claim is made from these local functional checks; Atlas and the full project timing/demo remain ticket 10 work.
