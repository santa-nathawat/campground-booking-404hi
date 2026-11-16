# Ticket 09 implementation and evidence

Implemented on `codex/09-logout`, locally verified on 2026-11-16 (Asia/Bangkok). No external publication, Git push, or deployment was performed.

## Adopted behavior

- Authenticated GET `/api/v1/auth/logout` returns 200 with `{ "success": true, "data": {} }`. It uses existing Bearer middleware, including signature/expiry verification and current-account lookup. Missing, invalid, or expired authentication returns 401 with `Not authorized`.
- Authentication remains HS256 JWTs expiring one hour after issuance. Logout changes no account or token state. A separately retained valid JWT can authenticate until expiry while its account exists; no server sessions or revocation list were added.
- No authentication cookies are issued or accepted. Logout has no cookie to clear and emits no `Set-Cookie` header. A valid token supplied only through a cookie does not authenticate.
- The existing authentication Postman collection adds logout and post-logout requests. Logout retains a demonstration copy in run-local `COPIED_TOKEN`, clears collection `TOKEN` after a successful response, and overrides its local value to prevent that run reusing the discarded credential. The next protected request receives 401; the demonstration copy still authenticates. The copy is removed after verification and is never stored in an exported collection/environment.
- Committed credential/token values remain empty. The collection creates one generated ordinary account; the disposable verification database is removed afterward. No existing database is used.

## Checks actually run

Local macOS host, Node.js v26.12.1, Postman CLI 1.76.0, real temporary MongoDB 8.2.6. No Atlas connection or configured `.env` credentials were used.

- Focused authentication HTTP suite: 46 tests passed. Includes login/logout/protected-request lifecycle, discarded-token denial, copied-token success, preserved account and subsequent login, exact success envelope, absent authentication cookies, cookie-only denial, and missing/malformed/expired/tampered/wrong-signature authentication rejection. Existing tests verify one-hour token expiry.
- `npm run typecheck`: passed for application and test sources.
- `npm run build`: passed.
- `npm test`: all 171 tests passed across six files, zero failures. The full run includes the final cookie-header and copied-token status assertions.
- Postman ran `postman/auth.postman_collection.json` with the committed local environment, an ephemeral local `BASE_URL` override, and `--no-report-events`: 13 requests, 41 assertions, zero failures, exit 0. The built `dist/app.js` listened on a temporary loopback port with its own temporary MongoDB database. Registration/login/logout emitted no cookies; the cleared credential returned 401; the copied credential returned 200 for the same account; unauthenticated logout returned 401.
- Postman printed optional login notices; local execution succeeded without cloud publication. This installed CLI does not support `postman status` (confirmed again after verification).

These are local functional checks. They do not establish Atlas connectivity, the full-project demonstration, or response-time compliance under ticket 10's conditions.
