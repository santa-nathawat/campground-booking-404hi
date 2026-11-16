# Architecture

Status: Tickets 01–03 authentication, campground reads/creation, seeding, administrator provisioning, and shared server foundation are implemented; bookings are planned. The language, framework, database, persistence library, module format, module grouping, and JWT approach are accepted in the [ADRs](decisions.md). The layout below includes implemented auth/campground/shared files, a campground seed script, an administrator setup script, and planned booking files.

## Backend organization

```text
backend/
  src/
    app.ts
    server.ts
    config/
    middleware/
    modules/
      auth/
        auth.routes.ts
        auth.controller.ts
        auth.service.ts
        auth.test.ts
        user.model.ts
      campgrounds/
        campgrounds.routes.ts
        campgrounds.controller.ts
        campgrounds.service.ts
        campgrounds.test.ts
        campground.model.ts
      bookings/
        bookings.routes.ts
        bookings.controller.ts
        bookings.service.ts
        bookings.test.ts
        booking.model.ts
    scripts/
```

Each module owns a route group, not one HTTP method/path pair. For example, auth owns register, login, and logout routes. Shared infrastructure outside `modules/` serves application setup, configuration, database connection, middleware, and setup scripts.

| Part | Responsibility |
| --- | --- |
| App setup | Assemble JSON parsing, middleware, routes, and error handling; allow tests to use the application without opening a listening port. |
| Server startup | Validate required environment configuration, connect to Atlas, and start listening only after a successful database connection. |
| Routes | Bind HTTP methods/paths to middleware and controllers. |
| Controllers | Translate validated HTTP inputs to service calls and service results/errors to HTTP responses. |
| Services | Apply booking rules, authorization policy, and persistence operations. |
| Models | Define Mongoose schemas and persistence behavior; owned by their module. |
| Middleware | Verify authentication, load the current user, check route-level roles, validate requests, and translate errors consistently. |
| Scripts | Seed campgrounds or provision an administrator through explicitly invoked commands. |

The request flow extends the lecture example: HTTP -> middleware -> route/controller -> service -> model -> MongoDB. Sequence diagrams must show actual implemented behavior, including relevant denied branches.

## Data responsibilities

Field names below are proposed conventions, not source requirements. Date-only storage is also proposed to make calendar-night semantics explicit.

| Model owner | Principal data | Invariants |
| --- | --- | --- |
| `auth` / User | ID, name, telephone, email, password hash, role | Required registration fields; unique email; only `user` and `admin` roles; password hash excluded from API representations. |
| `campgrounds` / Campground | ID, name, address, telephone | All three descriptive fields required; return campground data without private booking lists. |
| `bookings` / Booking | ID, owner reference, campground reference, check-in, check-out | Existing user and campground; fixed owner; 1-3 nights; date changes satisfy the Thailand-calendar rule. |

Store check-in and check-out as validated `YYYY-MM-DD` date-only strings. Calculate nights as the difference between calendar dates, not local-time hour arithmetic. Determine today's date using `Asia/Bangkok`. Reject nonexistent dates, timestamp inputs, and impossible ranges. The API contract provides examples.

There is no pitch, capacity, payment, or cancellation-status entity. Delete means remove the booking; no soft-delete workflow is currently specified. Ordinary users have no generic user-update or role-update endpoint.

## Authorization boundary

The authenticated user determines ownership on creation. Neither a user nor an administrator supplies another owner when making a booking. List queries scope ordinary users to their own records. Single-record reads and writes verify owner-or-administrator access. Updating a booking cannot change its owner.

JWT verification establishes the claimed identity; load the current user to ensure the account still exists and use its current role for authorization. Never trust an incoming registration role or a body-supplied booking owner. No fallback administrator or fallback signing secret is carried over from Assignment 7.

Expired bookings remain available for viewing/deletion. User decision during tickets 04–07: every update, including campground-only edits, validates the complete resulting stay against today and the duration limit. Historical bookings must be rescheduled to a valid current/future stay for an edit to succeed.

## Setup responsibilities

The team provisions the Atlas cluster/database. Application setup must document required environment-variable names using placeholders. Credentials and connection strings stay local. The campground seed command inserts three fictional demo fixtures with fixed ObjectIds and `$setOnInsert`, preserving existing records and bookings. It validates only `MONGO_URI`, disconnects after completion/failure, and reports sanitized failures; it is not a database-reset command. Administrator provisioning is separate and takes credentials from explicit local input/configuration rather than source literals.

Authentication setup/run commands are documented in the root README. Local authentication tests and a built-app Postman run have passed; see [evidence](auth-implementation.md). Campground seeding and browsing are locally verified in [ticket 02 evidence](campgrounds-implementation.md). Administrator setup and creation are locally verified in [ticket 03 evidence](admin-campgrounds-implementation.md). Atlas access remains unverified.
