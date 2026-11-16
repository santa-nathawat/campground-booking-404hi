# API requests

Import `auth.postman_collection.json` and `local.postman_environment.json` into Postman. Select the environment and run requests in order against the running API. `BASE_URL` defaults to `http://127.0.0.1:5000`.

Registration generates a fresh email/password for each run. Optionally set `TEST_EMAIL` and `TEST_PASSWORD` locally; a reused email will conflict on subsequent runs. Credentials and token values are empty in the committed files. Login and registration save `TOKEN` at runtime for the current-user request.

Nine requests cover successful registration/login/current user, duplicate email, required telephone, forbidden role input, incorrect password, and missing/invalid tokens. Automated HTTP tests cover expiry and additional edge cases.

Use a designated test database. Runs create one ordinary user and do not remove existing data. Clear generated credentials and tokens before exporting; never commit a populated environment or collection.

From the repository root, with the API running and Postman CLI installed:

```sh
postman collection run postman/auth.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

The local run does not require cloud publication. CLI login is needed only if you choose to publish run details.

## Campground browsing

Seed first from `backend/` with `npm run seed:campgrounds`, using the same designated test database as the API. Import `campgrounds.postman_collection.json` and the existing local environment, then run the collection in order:

```sh
postman collection run postman/campgrounds.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

Eleven requests/40 assertions cover registration/login, listing and selecting a seeded campground, public response fields, string telephone preservation, denied list/detail access, malformed/missing IDs, and authentication before ID validation. The collection saves the selected campground ID and telephone at runtime and creates a fresh ordinary user independently of the authentication collection. Committed variables are empty.

The browse collection expects all three demo fixtures and a telephone beginning with zero on the first fixture. Use a fresh temporary database for repeatable fixture assertions; seeding intentionally preserves any locally edited fixtures. Raw booking preservation, empty lists, expired tokens, and administrator reads are checked by the automated suite. These local functional checks do not establish Atlas timing compliance.

## Administrator campground creation

Provision an administrator through `npm run setup:admin` first, using the API's designated test database. Set `ADMIN_EMAIL` and secret `ADMIN_PASSWORD` locally in the environment; committed values are empty. Import `admin-campgrounds.postman_collection.json` and run in order:

```sh
postman collection run postman/admin-campgrounds.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

Ten requests cover unauthenticated denial, rejected public role escalation, ordinary-user registration/denial, administrator login, missing/unknown field rejection, successful creation, and ordinary-user list/detail visibility. It creates one ordinary account and one campground per run, preserves existing records, and needs no seeded destinations. There is no public cleanup endpoint; use a temporary database for disposable runs. Clear locally supplied credentials and generated tokens before exporting. Automated tests additionally execute the setup command, check duplicate-account preservation, and verify revoked administrator access with an existing token.

## Bookings (tickets 04–07)

Seed demo campgrounds, then run `bookings.postman_collection.json` with the local environment against a designated test database. The collection generates two accounts, separate tokens, and future Bangkok calendar dates; committed runtime variables remain empty. Run requests in order. The 29 requests/75 assertions cover creation, invalid duration/ownership input, both own-only lists, detail, cross-user read/update/delete denials, merged updates, persisted read-back, deletion, and empty lists. Cleanup removes only the two bookings created by the run; generated accounts remain until the disposable database is removed.

```sh
postman collection run postman/bookings.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

Clear generated credentials/tokens before exporting. Use a disposable database for account cleanup; there is no public reset endpoint.
