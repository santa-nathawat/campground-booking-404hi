# ADR-0006: Group files by route

Status: Accepted

## Context

Assignment 7 has one server file. The team wants related code together instead of global route/controller folders.

## Decision

Use `backend/src/modules/auth`, `campgrounds`, and `bookings`.
Each module owns a route group and contains routes, controller, service, models, and tests.
Shared middleware lives in `backend/src/middleware/`.

## Consequences

Related code stays together. One route group can contain several endpoints.
Keep model ownership clear to avoid duplication and circular imports.
Sequence diagrams must show the added service layer.
