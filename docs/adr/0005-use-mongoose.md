# ADR-0005: Use Mongoose

Status: Accepted

## Context

The baseline and lectures use Mongoose. Using the MongoDB driver directly would mean replacing existing model code.

## Decision

Keep Mongoose for schemas, models, and database access.

## Consequences

Keep model schemas and TypeScript types aligned. Mongoose adds an abstraction over the MongoDB driver.
Request validation, permissions, and business rules remain application responsibilities.
