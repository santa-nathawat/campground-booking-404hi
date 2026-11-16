# 09: Log out

**Status:** Implemented and locally verified. See [evidence](../../.agents/context/logout-implementation.md).
**Blocked by:** [01](01-register-login.md)

Clients can log out and remove their saved authentication credentials.

## Done when

- [x] Provide logout and clear any authentication cookie the API issues.
- [x] After successful logout, Postman clears its saved token. Requests without credentials must fail.
- [x] Demonstrate and document that a copied unexpired JWT remains valid. Do not add server-side revocation or sessions.
- [x] Test login, logout, and protected requests through HTTP and Postman. Document actual token expiry and cookie behavior.
