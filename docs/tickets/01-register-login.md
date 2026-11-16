# 01: Register and log in

**Status:** Approved; not started.
**Blocked by:** None.

Users can register, log in, and verify their identity.

## Done when

- [ ] Start the TypeScript/Express API with a real MongoDB connection. Document setup and run commands.
- [ ] Require name, telephone, email, and password. Reject duplicate emails. Registration creates ordinary users only.
- [ ] Hash passwords with salted bcrypt. Never return passwords or hashes.
- [ ] Return an expiring JWT on successful authentication. Provide a current-user check.
- [ ] Reject bad credentials and missing, invalid, or expired tokens. Remove fallback administrator credentials and signing secrets.
- [ ] Test registration, login, token checks, and privilege escalation through HTTP. Add sanitized Postman requests.
