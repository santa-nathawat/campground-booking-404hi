# Decisions

## Confirmed working constraints

- Use the existing `campground-booking-404hi` repository and remote.
- Write documentation in English, retaining Thai instructor wording when useful.
- Deliver the required scope. No extra-credit features are currently planned.
- Adapt and reorganize the actual Assignment 7 baseline, preserving an honest comparison of changes.
- Require authentication for campground listings.
- The team will provision the MongoDB Atlas cluster and database; application connection configuration will be supplied through local environment variables.
- Each booking is a stay of 1-3 nights, represented by check-in and check-out dates. There is no additional booking-count limit.
- Overlapping bookings are allowed; campground capacity and individual pitches are outside the agreed scope.
- Provide a repeatable development/demo campground seed command and an administrator-only campground creation POST endpoint. Seeding adds missing seed records without deleting or replacing existing campgrounds or bookings. No extra-credit claim is planned.
- Provision administrators through a controlled setup command; public registration creates ordinary users.
- Use the Thailand calendar (`Asia/Bangkok`): check-in today or later, and check-out 1-3 days later. Revalidate on creation or changing dates.
- Owners and administrators may edit campground and booking dates; the booking owner is immutable. Administrators may create their own bookings under the same rules.

These are project setup facts, not separate architecture records.

## Architecture records

Accepted records:

- [0001: TypeScript](../../docs/adr/0001-use-typescript.md)
- [0002: Express](../../docs/adr/0002-use-express.md)
- [0003: MongoDB Atlas](../../docs/adr/0003-use-mongodb-atlas.md)
- [0004: ECMAScript modules](../../docs/adr/0004-use-ecmascript-modules.md)
- [0005: Mongoose](../../docs/adr/0005-use-mongoose.md)
- [0006: Organize by route group](../../docs/adr/0006-organize-by-route-group.md)
- [0007: JWT authentication](../../docs/adr/0007-use-jwt-authentication.md)

The team confirmed ECMAScript modules (`import`/`export`), Mongoose, and the lecture-style JWT authentication/logout behavior. A copied JWT remains usable until expiry; server-side revocation is outside this accepted approach.

Application location: `backend/src/modules/`. Each directory owns one route group, which can contain multiple HTTP operations and child paths. For example, `auth/` owns registration/login/logout routes and contains `auth.controller.ts`, `auth.routes.ts`, `auth.service.ts`, `auth.test.ts`, and the user model. Shared middleware lives under `backend/src/middleware/`. This replaces the earlier ambiguous wording about separating routes and controllers.

## Final design review

The business-rule interview is settled through Q17. Detailed [API](api-contract.md), [architecture](architecture.md), and [verification](verification.md) notes preserve implementation context. Details labeled proposed remain recommendations, not earlier user decisions. The user does not need to read these agent notes.

Exact dependency versions, package scripts, test runner, token lifetime, and deployment target will be selected when implementing the relevant part. They are not invented as accepted architecture decisions here. Atlas provisioning belongs to the team; the connection is not yet configured or verified.

## ADR conventions

Number new records sequentially and use descriptive filenames.

Each ADR records exactly one decision. Runtime, backend framework, and DBMS belong in separate records. Record the real alternatives and reason for the choice in Context and Decision rather than adding boilerplate sections.

```markdown
# ADR-NNNN: <one decision>

Status: Proposed | Accepted | Superseded by ADR-NNNN

## Context

Describe the problem, constraints, and relevant alternatives.

## Decision

State the single choice and why it addresses the context.

## Consequences

Describe benefits, costs, limitations, and work this choice creates.
```

Use Proposed for a concrete option under discussion; use Accepted only for an agreed choice. The ADR format follows the team's explicit request, including the three sections above.
