# Authentication requests

Import `auth.postman_collection.json` and `local.postman_environment.json` into Postman. Select the environment and run requests in order against the running API. `BASE_URL` defaults to `http://127.0.0.1:5000`.

Registration generates a fresh email/password for each run. Optionally set `TEST_EMAIL` and `TEST_PASSWORD` locally; a reused email will conflict on subsequent runs. Credentials and token values are empty in the committed files. Login and registration save `TOKEN` at runtime for the current-user request.

Nine requests cover successful registration/login/current user, duplicate email, required telephone, forbidden role input, incorrect password, and missing/invalid tokens. Automated HTTP tests cover expiry and additional edge cases.

Use a designated test database. Runs create one ordinary user and do not remove existing data. Clear generated credentials and tokens before exporting; never commit a populated environment or collection.

From the repository root, with the API running and Postman CLI installed:

```sh
postman collection run postman/auth.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

The local run does not require cloud publication. CLI login is needed only if you choose to publish run details.
