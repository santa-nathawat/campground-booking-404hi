# 01: Register and log in

**Status:** Implemented; locally verified. Atlas connection remains unverified.
**Blocked by:** None.

Users can register, log in, and verify their identity.

## Done when

- [x] Start the TypeScript/Express API with a real MongoDB connection. Document setup and run commands.
- [x] Require name, telephone, email, and password. Reject duplicate emails. Registration creates ordinary users only.
- [x] Hash passwords with salted bcrypt. Never return passwords or hashes.
- [x] Return an expiring JWT on successful authentication. Provide a current-user check.
- [x] Reject bad credentials and missing, invalid, or expired tokens. Remove fallback administrator credentials and signing secrets.
- [x] Test registration, login, token checks, and privilege escalation through HTTP. Add sanitized Postman requests.
