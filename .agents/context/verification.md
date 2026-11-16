# Verification plan and implementation sequence

Status: Tickets 01–02 local checks passed; see [authentication evidence](auth-implementation.md) and [campground evidence](campgrounds-implementation.md). The full-project procedures below remain planned; no Atlas or performance requirement evidence is claimed.

## Meaningful test coverage

Keep each module's tests beside its implementation as requested. Exercise observable behavior and persisted state rather than mirroring function bodies. Use Postman/Newman for the required API-level evidence; Vitest/Supertest run colocated authentication tests against isolated MongoDB.

| Area | Cases to verify |
| --- | --- |
| Registration | Required name/telephone/email/password; duplicate normalized email; hashed stored password; password excluded from responses; supplied role cannot grant admin. |
| Login/protection | Correct and incorrect credentials; missing/expired/invalid token; nonexistent current user; no fallback secret or fallback administrator. |
| Logout | Clear client token and issued cookie; no-credential request fails; copied unexpired token limitation accurately demonstrated/documented. |
| Campgrounds | Login required; name/address/telephone returned; administrator can POST; ordinary user denied; no private bookings embedded. |
| Create booking | Owner derived from caller; existing campground; successful 1/2/3-night stays; today accepted in Bangkok; past, malformed, nonexistent, zero/negative and 4-night dates rejected. |
| Listing/detail | User A sees only A's records; user B cannot read A's detail; administrator sees both; empty result has the agreed shape. |
| Update | Owner/admin can change campground/dates; merged date range validated; owner remains fixed; date changes cannot move check-in into the past; campground-only historical edits fail unless rescheduled to a valid current/future stay (user decision during tickets 04–07). |
| Delete | Owner/admin succeeds; other user denied; record removed; missing ID follows agreed error contract. |
| Administrator booking | Administrator can create own booking, with the same duration/date limits and no client-chosen owner. |
| Overlap/count | Two users may book the same campground/dates; one user may create more than three valid bookings. No inherited three-appointment limit survives. |
| Setup | Re-run campground seed; no fixture duplicates, overwritten existing campgrounds, or deleted bookings. Administrator setup does not expose credentials or permit public role escalation. |

For date boundaries, control the clock in relevant tests and cover times around midnight in Thailand. Validate actual dates, including month/year boundaries, rather than accepting strings based only on their shape.

## Proposed repeatable demo

Use a designated test database, not data relied on by another team member. Provision one administrator, users A and B, and at least three campgrounds. Generate booking dates at run time. Acquire each user's token through login and maintain separate token variables for cross-user checks.

Run: authentication -> campground listing/admin creation -> booking creation -> own/admin listing/detail -> allowed and denied updates -> allowed and denied deletes -> logout. Include invalid duration and past-date checks. Capture created IDs, preserve assertions, and clean up only the booking IDs created by that run. Do not add public delete/reset APIs merely to clean up demo campground creation; use dedicated test fixtures or explicit test-database maintenance.

Export sanitized collection JSON and an environment template into the repository when available. Keep live tokens, passwords, Atlas URIs, and generated evidence containing secrets out of Git. Interrupted runs must not require a destructive reset of shared data.

## Proposed performance evidence conditions

Measure a local backend connected to the team's Atlas test database using a sequential Postman Runner/Newman suite, one request at a time. Propose a starting dataset of three campgrounds, two ordinary users, one administrator, and twenty bookings. Record the actual machine/runtime, network location, Atlas region/tier, dataset size, and request counts with the result.

Record each HTTP request's response time and assert at most 3000 ms, including registration/login rather than only simple reads. Separate startup/database-connection readiness from request handling, and report cold first requests and repeated requests explicitly. Keep individual failures visible rather than using an average to hide them. This is evidence for the measured conditions, not a claim about unspecified concurrent load or unlimited data volume. Retry after a code/network change produces a new recorded result rather than erasing a failure.

## Implementation order

1. Establish the TypeScript/ECMAScript-module backend skeleton, environment validation, Atlas connection, and shared error handling. Select compatible maintained tooling and document runnable commands.
2. Adapt registration/login, user model, authentication/role middleware, and controlled administrator provisioning. Remove the Assignment 7 shortcuts.
3. Implement the campground model, authenticated listing/detail, administrator creation, and repeatable seed command.
4. Implement owned bookings, date rules, administrator access, and module tests covering authorization and merged updates.
5. Assemble and run the Postman/Newman suite, inspect confidentiality, and collect performance evidence under recorded conditions.
6. Update the actual baseline change map, author/render the required diagrams from implemented behavior, and prepare presentation/demo evidence.

Ticket 01 completes the server foundation and registration/login/current user. Ticket 02 completes campground list/detail and non-destructive demo seeding. Administrator provisioning and the remaining features stay assigned to their approved tickets.

## Completion evidence

For each FR/NFR, record test request or test name, result, relevant commit, and artifact location once verified. Preserve actual GitHub contributor evidence. Final delivery follows [the submission checklist](submission.md). Editable/rendered diagrams, team member assignments, final dependency versions, Atlas configuration, test results, presentation slides, and demo evidence remain future work.
