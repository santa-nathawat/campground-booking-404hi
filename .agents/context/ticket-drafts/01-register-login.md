# 01: Register, log in, and verify identity

Status: Plan approved; not started. Not published or labeled in an external tracker.

Human summary: [ticket 01](../../../docs/tickets/01-register-login.md). This file retains detailed acceptance criteria.

## What to build

A visitor can register, log in, and prove their identity through the API using a persisted account and JWT.

## Acceptance criteria

- [ ] Provide a runnable TypeScript/ECMAScript-module Express API connected through Mongoose to configured MongoDB. Validate required startup configuration and document real setup/run commands.
- [ ] Adapt the Assignment 7 authentication flow and record its baseline commit; remove fallback administrator credentials and signing secrets.
- [ ] Registration requires name, telephone, email, and password; duplicate email is rejected. Public registration cannot create an administrator.
- [ ] Persist a salted password hash and exclude passwords/hashes from responses. Successful registration/login returns an expiring JWT.
- [ ] Correct credentials succeed; incorrect credentials and missing/invalid/expired tokens fail without exposing internals. A current-user operation demonstrates authentication against the stored account.
- [ ] Use the accepted authentication module structure. Document chosen validation, response, token-lifetime, runtime, and test-tool conventions without presenting earlier proposals as prior user approval.
- [ ] Add HTTP tests using an isolated MongoDB database, including failed registration/login, privilege escalation, and token checks. Add sanitized Postman authentication requests; keep tests colocated with their module.

## Blocked by

None (can start immediately)
