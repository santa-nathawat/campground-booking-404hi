# 09: Log out

**Status:** Approved; not started.
**Blocked by:** [01](01-register-login.md)

Clients can log out and remove their saved authentication credentials.

## Done when

- [ ] Provide logout and clear any authentication cookie the API issues.
- [ ] After successful logout, Postman clears its saved token. Requests without credentials must fail.
- [ ] Demonstrate and document that a copied unexpired JWT remains valid. Do not add server-side revocation or sessions.
- [ ] Test login, logout, and protected requests through HTTP and Postman. Document actual token expiry and cookie behavior.
