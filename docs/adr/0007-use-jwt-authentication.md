# ADR-0007: Use JWT authentication

Status: Accepted

## Context

Assignment 7 and Chapter 8 teach JWT authentication. The team wants to follow that approach.

## Decision

Use signed, expiring JWTs. Logout clears client credentials and any issued auth cookie.
Do not add server-side token revocation.

## Consequences

Postman sends a Bearer token. Middleware verifies it; authorization still checks roles and ownership.
A copied token remains valid until expiry. Store the signing secret in environment configuration.
Token lifetime and cookie settings remain to be selected.
