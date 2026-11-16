# Campground Booking: Topic 2 implementation spec

Status: local spec; not published or labeled in an issue tracker. Business rules, architecture choices, and testing boundaries are confirmed. API details identified as proposed remain recommendations. No application is implemented or verified yet.

## Problem Statement

The team must adapt its Assignment 7 vaccination-appointment API into a campground-booking REST API for Topic 2 of 2110503 Software Development Practice.

Registered users need to book stays of up to three nights and manage their own bookings. Administrators need to manage everyone's bookings. The submitted baseline cannot meet these requirements unchanged: appointments lack ownership, authenticated users can access other users' appointments, and creation limits appointment count per hospital rather than campground stay length.

The team must demonstrate the running API through Postman and present evidence of changed code, required diagrams, and team contributions. A frontend and separate written report are not required.

## Solution

Build a TypeScript and Express API backed by MongoDB Atlas through Mongoose. Adapt the actual Assignment 7 implementation while preserving an honest comparison with its baseline commit.

Provide registration, JWT login/logout, authenticated campground browsing, administrator campground creation, and owned booking creation/listing/detail/update/deletion. Keep each stay between one and three calendar nights using the Thailand calendar. Administrators can manage all bookings and create their own bookings under the same stay rules.

Provide controlled administrator provisioning and a repeatable campground seed command. Ship meaningful HTTP-level tests, a reusable Postman collection, measured response-time evidence, and the required presentation/diagram materials. Keep human documentation brief and detailed working evidence in agent context.

## User Stories

1. As a visitor, I want to register with my name, telephone number, email, and password, so that I can book campground stays.
2. As a visitor, I want missing registration information rejected, so that my account has the required contact details.
3. As a registered user, I want my email to identify my account uniquely, so that another registration cannot reuse my identity.
4. As a registered user, I want to log in with email and password, so that I can access protected functions.
5. As a registered user, I want incorrect credentials rejected, so that another person cannot access my account.
6. As a registered user, I want protected functions to require valid authentication, so that private bookings remain private.
7. As a registered user, I want to log out by clearing my client credentials, so that later requests from that client are unauthenticated.
8. As a registered user, I want the JWT logout limitation explained, so that I know a copied unexpired token is not revoked.
9. As a registered user, I want my password stored as a salted hash and excluded from responses, so that the API does not expose my password.
10. As an administrator, I want public registration to create only ordinary users, so that visitors cannot grant themselves administrator powers.
11. As a team member, I want a controlled administrator setup command, so that I can prepare real administrator access without a fallback login.
12. As a registered user, I want to list campgrounds after login, so that I can choose a destination.
13. As a registered user, I want to see each campground's name, address, and telephone number, so that I can identify and contact it.
14. As a registered user, I want campground information to exclude private booking lists, so that browsing does not expose another user's activity.
15. As an administrator, I want to create a campground through an authenticated POST operation, so that the destination list can grow without editing seed fixtures.
16. As an administrator, I want ordinary users denied campground creation, so that only authorized users maintain destination data.
17. As a team member, I want a campground seed command, so that development and live demonstrations have initial destinations.
18. As a team member, I want repeated seeding to add missing fixtures without duplicates or overwritten records, so that setup is safe to repeat.
19. As a team member, I want seeding to preserve existing bookings, so that preparing destinations does not destroy work.
20. As a registered user, I want to create a booking for a chosen existing campground, so that my intended stay is recorded.
21. As a registered user, I want to specify check-in and check-out dates, so that the duration of my stay is clear.
22. As a registered user, I want to book one, two, or three nights, so that valid stays within the assignment limit are supported.
23. As a registered user, I want stays beyond three nights rejected, so that bookings follow the project rule.
24. As a registered user, I want zero-length and reversed stays rejected, so that every booking represents at least one night.
25. As a registered user, I want invalid or nonexistent calendar dates rejected, so that my stay can be interpreted reliably.
26. As a registered user, I want to check in today or later according to Thailand's calendar, so that booking validation matches the agreed local date.
27. As a registered user, I want past check-in dates rejected for new bookings or date changes, so that I do not create a newly scheduled stay in the past.
28. As a registered user, I want every booking I create assigned to my authenticated account, so that another caller cannot choose me as an arbitrary booking owner.
29. As a registered user, I want to view my own booking list, so that I can review my stays.
30. As a registered user, I want to inspect one of my bookings, so that I can review its campground and dates.
31. As a registered user, I want other ordinary users prevented from reading my bookings, so that my transactions remain confidential.
32. As a booking owner, I want to change my booking's campground, so that I can choose a different destination.
33. As a booking owner, I want to change my booking's dates within the same rules, so that I can revise my stay.
34. As a booking owner, I want updates validated against the resulting complete stay, so that changing one date cannot bypass duration validation.
35. As a booking owner, I want the booking's owner to stay fixed, so that edits cannot transfer a booking to another account.
36. As a booking owner, I want to delete my booking, so that I can remove a stay I no longer want.
37. As a booking owner, I want other ordinary users prevented from editing or deleting my booking, so that only authorized people can change it.
38. As an administrator, I want to view all users' bookings, so that I can oversee the system.
39. As an administrator, I want to inspect an individual user's booking, so that I can review its details.
40. As an administrator, I want to edit any user's campground or booking dates, so that I can assist users without changing ownership.
41. As an administrator, I want to delete any user's booking, so that I can remove a booking when needed.
42. As an administrator, I want to create personal bookings under the same one-to-three-night rule, so that administrator access does not bypass stay validation.
43. As a registered user, I want overlapping bookings at the same campground to be allowed, so that the system does not invent an unspecified capacity restriction.
44. As a registered user, I want more than three separate valid bookings to be allowed, so that the old appointment-count rule does not become a new booking limit.
45. As a registered user, I want prior bookings to remain viewable and deletable, so that past dates do not hide my records.
46. As a team member, I want API behavior verified through Postman, so that the live demonstration follows the assignment's testing requirement.
47. As a team member, I want tests with two ordinary users and an administrator, so that authorization is demonstrated rather than assumed.
48. As a team member, I want every measured request checked against the three-second requirement, so that slow requests are not hidden by an average.
49. As a team member, I want recorded timing conditions and individual failures, so that performance claims match the evidence.
50. As a team member, I want reusable test data and cleanup limited to run-owned records, so that tests and demonstrations can be repeated safely.
51. As a team member, I want configuration supplied without committed secrets, so that sharing the repository does not expose Atlas or authentication credentials.
52. As a team member, I want a clear comparison with the submitted Assignment 7, so that I can explain the code changes in the presentation.
53. As a team member, I want use-case, REST UML Profile class, and sequence diagrams aligned with the implementation, so that the documentation follows the lecture notation.
54. As a team member, I want actual contributor evidence and a repository link in the presentation, so that the instructor can review teamwork and source code.
55. As a team member, I want one presentation file and a separate live program demonstration, so that submission follows the supplied instructions.
56. As a team member, I want short human documentation with detailed agent context kept separate, so that future work does not require reading an interview transcript.

## Implementation Decisions

### Confirmed architecture

- Use TypeScript, ECMAScript modules, Express, MongoDB Atlas, Mongoose, and signed, expiring JWTs. These are separate accepted architecture decisions.
- Adapt the real Assignment 7 baseline rather than claiming a wholly unrelated implementation is a small modification.
- Group application code by the authentication, campgrounds, and bookings route groups. A route group may expose multiple operations and child routes.
- Each module owns its routes, controller, service, relevant models, and colocated tests. Shared middleware handles cross-cutting concerns.
- Routes connect HTTP operations and middleware. Controllers translate requests and responses. Services apply business rules. Models define persistence behavior.
- Keep architecture records short, one decision each, using Context, Decision, and Consequences.

### Data and access rules

- A user has a name, telephone number, unique email, password hash, and an ordinary-user or administrator role.
- A campground has a name, address, and telephone number.
- A booking references its owner and campground and records check-in/check-out dates.
- Require authentication for campground browsing and all booking operations. Campground creation additionally requires administrator access.
- Set booking ownership from the authenticated caller. Ordinary users access only their own bookings; administrators access any booking. Ownership cannot change through updates.
- Owners and administrators may change the campground and dates. Administrators may create only their own bookings through the ordinary creation flow; no on-behalf-of creation workflow is specified.
- Use the Thailand calendar, identified by `Asia/Bangkok`. New check-in dates and changed booking dates must resolve to today or later.
- Check-out ends the stay and is excluded from its nights. December 1 to December 4 is three nights. Validate one to three calendar nights after creation and date changes.
- Validate an updated booking's merged date pair, not just the submitted individual date.
- Do not add an aggregate booking-count limit, pitch inventory, or capacity checks. Overlapping bookings are allowed.
- Public registration creates ordinary users. Administrators are provisioned through a controlled command; no source-coded fallback administrator is retained.
- Provide a campground seed command that inserts missing fixtures without duplicating, deleting, or replacing existing campground records or bookings.
- Use runtime configuration for database access and JWT secrets. Do not carry over a fallback signing secret.

### Authentication and logout

- Follow the lecture's JWT approach rather than introduce server-stored login sessions.
- The Postman client presents a Bearer JWT for protected requests.
- Logout removes the saved client credential and clears any authentication cookie the API issues. Cookie transport settings remain undecided.
- There is no server-side JWT revocation mechanism. An independently copied token can remain valid until expiry. Document this as a limitation, not a failed revocation promise.

### Proposed API conventions, not additional confirmed choices

The kickoff documents contain a concrete API proposal. The user confirmed business behavior, not every proposed wire-format or validation detail. Preserve that distinction during implementation and ticketing.

- Expose registration, login, current-user inspection, logout, campground list/detail/admin creation, and booking create/list/detail/update/delete operations. Registration, login/logout, campground listing, campground POST, and booking ownership behavior implement confirmed scope; individual path spellings and supporting detail operations are proposed conventions.
- Use a versioned REST base, JSON request/response bodies, string identifiers, and Bearer authentication.
- Proposed booking request fields are `campgroundId`, `checkIn`, and `checkOut`, with dates represented as validated date-only `YYYY-MM-DD` values. The choice to store date-only strings is also proposed, not a previously accepted DB schema decision.
- Proposed update behavior allows a nonempty subset of editable fields, with the merged booking validated. The proposed PUT operation retains the baseline's partial-update style.
- Proposed responses use a success flag and data payload, with a token on authentication responses, a returned-item count on lists, and a message on errors.
- Proposed success statuses are 201 for creation and 200 for reads, authentication, update, delete, and logout.
- Proposed error statuses are 400 for invalid input, 401 for authentication failures, 403 for role/ownership denial, 404 for missing resources, 409 for duplicate email, and 500 for unexpected internal failures without leaked internals.
- Proposed validation includes required nonempty contact fields, telephone strings, trimmed/lowercase unique email, an eight-character minimum password, salted bcrypt hashing, and rejecting unexpected request fields. Passwords must not be silently trimmed.
- Proposed authentication middleware loads the current account after JWT verification and authorizes using its stored role. This avoids relying only on stale role claims.
- A proposed edge-case interpretation allows campground-only edits of past bookings without revalidating unchanged historical dates; changing either date revalidates the entire resulting date range. Prior bookings remain viewable/deletable.
- The lecture-compatible logout HTTP method, token lifetime, cookie issuance/acceptance settings, exact dependency versions, test runner, command names, and deployment target remain implementation details to settle without inventing earlier approval.

## Testing Decisions

### Confirmed testing boundaries

The user confirmed these boundaries during spec preparation:

- Use the HTTP API backed by an isolated MongoDB test database as the primary testing boundary for authentication, authorization, campground operations, booking rules, and persisted outcomes.
- Test campground seeding and administrator provisioning through their commands, because those operations are not HTTP features.
- Add focused date-boundary tests only where controlling the clock makes meaningful calendar behavior easier to verify.

Exercise externally visible behavior and persisted results. Avoid tests that merely check internal method calls, repeat function bodies, or require a separate mocked test layer for each route/controller/service/model. Keep tests with the modules they cover while preferring the highest useful boundary.

### Coverage

- Authentication: complete/missing registration fields, duplicate email, successful/failed login, invalid/expired/missing token, account/role checks, password secrecy, privilege escalation denial, and the accepted logout limitation.
- Campgrounds: authenticated list/detail, required contact data, administrator creation, ordinary-user denial, and no embedded private booking data.
- Bookings: one-, two-, and three-night successes; four-night, zero-length, reversed, nonexistent, malformed, and past-date rejection; check-in today; month/year transitions and Thailand midnight.
- Ownership: users A and B plus one administrator. Check every list/detail/update/delete path, not just a middleware unit test. Ensure the caller cannot choose or change ownership.
- Updates: validate merged dates, destination existence, administrator edits, fixed ownership, and any finalized historical-booking behavior.
- Allowed behavior: overlapping bookings and more than three valid bookings per user remain possible; administrator-created bookings obey the same stay rules.
- Setup: administrator provisioning uses controlled inputs; repeated campground seeding is non-destructive and does not duplicate fixtures.
- Demonstration: save a reusable Postman collection and sanitized environment template, generate dates at runtime, capture created identifiers, and preserve run-owned cleanup rules.

### Prior art and evidence

The current project has documents only. There is no implemented application or project test suite to reuse yet. Assignment 7 provides an existing Postman/Newman classroom collection and grading automation as reference material, not proof of Topic 2 compliance. Its per-hospital appointment-count assertions must not become campground booking rules. Do not import classroom automation blindly or assume baseline tests passed; none were run during kickoff/spec preparation.

Use Postman Runner or Newman for API verification and the live demo. Select a compatible TypeScript test runner during implementation. Do not introduce a public reset/delete endpoint solely to clean up a test run.

Every request must meet the brief's three-second response requirement. The current proposed measurement procedure uses a local backend, an Atlas test database, sequential requests, three campgrounds, two ordinary users, an administrator, and twenty bookings. Record actual runtime/machine, network, Atlas region/tier, dataset, request counts, and cold/repeated timings. Check individual requests, including registration/login, against 3000 ms. Keep failed measurements visible. This procedure is proposed evidence under stated conditions, not a claim about unspecified concurrency or unlimited data volume.

## Out of Scope

- Frontend, browser application, or mobile UI.
- Extra-credit features or claims.
- Payments, pitch selection, campground capacity, availability inventory, and overlap rejection.
- An aggregate maximum of three bookings or three appointments per campground/user.
- Campground update/delete endpoints.
- Booking ownership transfer or administrator booking creation on behalf of other users.
- General user/profile/role-management APIs or public administrator registration.
- Cancellation-state workflows or soft deletion; the agreed operation deletes a booking.
- Server-stored sessions, JWT revocation lists, and a promise that logout invalidates every copied token.
- Advanced filtering, pagination, and nested booking APIs in the initial API proposal.
- A mandated deployment provider or cloud-monitoring setup; no such requirement has been established from the supplied brief.
- Publishing secrets, live tokens, or credentials in source, Postman exports, screenshots, or presentation evidence.
- Creating reusable skills or changing global agent configuration as part of this application implementation spec.

## Further Notes

### Baseline and current state

Project repository: https://github.com/santa-nathawat/campground-booking-404hi

Assignment 7 baseline: https://github.com/2110503-69CP/503cp69-a7-2-santa-nathawat at commit `fd409c2e38691f7adc8beb81a7767510fe3b4ade`.

At inspection, the project repository contains planning documents and has no application commits. Baseline inspection found hospital/appointment CRUD, JWT authentication, no appointment owner, a three-appointments-per-hospital creation limit, no logout endpoint, and assignment-specific fallback authentication behavior. These are source-inspection findings, not recorded runtime test results. Preserve the commit reference and document actual resulting behavior and changed code as implementation proceeds.

The team will provision MongoDB Atlas. No Atlas connection or application startup is verified. Exact dependency versions, package scripts, test tooling, and deployment settings must be selected and documented when implemented.

### Delivery

Submit one presentation file; no separate written report is required. Include the assigned problem, actual code changes from Assignment 7, use-case diagram, REST UML Profile class diagram, sequence diagram, GitHub Contributors evidence, extra-credit list marked None, and the project repository link. Link larger diagram images when embedded versions are unreadable.

The REST UML Profile must express resources, representations, paths, and HTTP operations; an ER diagram alone does not replace it. Sequence diagrams must reflect the resulting service-based request flow and relevant authorization/validation paths. Diagrams may focus on changed behavior, as permitted by the supplied instructor announcement.

Demonstrate the running program separately through Postman Runner or Newman. The course introduction gives at most seven presentation minutes and three Q&A minutes, subject to a newer instructor announcement. Do not invent team members, contributions, completed diagrams, test results, or performance claims.

### Publication and next handoff

Testing boundaries are confirmed. Project issue-tracker and triage-label configuration are missing, so this spec is not published and does not yet carry the `ready-for-agent` tracker label. Run `/setup-matt-pocock-skills` to configure the destination and label vocabulary before publication.

After publication, pass the actual spec reference to `to-tickets` in a fresh chat. Preserve confirmed decisions versus proposals, source requirements, the testing boundaries, and scope exclusions. Ticket breakdown is a later step; this spec does not authorize silently adding requirements or treat any planned implementation as complete.
