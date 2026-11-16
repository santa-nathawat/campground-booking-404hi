# ADR-0003: Use MongoDB Atlas

Status: Accepted

## Context

The brief allows MongoDB Atlas or PostgreSQL. Assignment 7 already uses MongoDB.

## Decision

Use MongoDB Atlas. The team provisions the cluster and database.

## Consequences

Avoid a PostgreSQL migration. The app needs network access and credentials from environment variables.
Application code must enforce references, permissions, and stay rules.
