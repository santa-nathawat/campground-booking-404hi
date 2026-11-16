# Campground Booking

Topic 2 project for 2110503 Software Development Practice.

Build a REST API for campground stays of 1–3 nights. Test with Postman. No frontend required.

**Status:** Tickets 01–09 authentication, logout, campgrounds, administrator setup, and owner/administrator booking CRUD are implemented and locally verified. Full-project Atlas/timing verification, diagrams, and presentation remain pending.

## Run the API

Use Node.js 26 and npm. From this repository:

```sh
cd backend
npm ci
cp .env.example .env
openssl rand -base64 32
```

Set `JWT_SECRET` in `.env` to the generated value. Set `MONGO_URI` to your local MongoDB database or the team’s Atlas database URI. For Atlas, configure database credentials and network access in Atlas first. Keep `.env` local. `PORT` defaults to 5000; invalid configuration or unavailable MongoDB prevents startup.

```sh
npm run dev
# Or build and run JavaScript:
npm run build
npm start
```

Implemented endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `GET /api/v1/auth/logout`, `GET /api/v1/campgrounds`, `GET /api/v1/campgrounds/:id`, and administrator-only `POST /api/v1/campgrounds`. Booking CRUD is also implemented at `/api/v1/bookings` (POST/GET) and `/api/v1/bookings/:id` (GET/PUT/DELETE). Send `Authorization: Bearer <token>` for protected requests. Tokens expire after one hour. Logout returns an empty success response; clients must discard their saved token. A copied unexpired JWT remains valid. No authentication cookies are issued or accepted.

## Seed demo campgrounds

From `backend/`, with `MONGO_URI` configured in `.env` or the environment:

```sh
npm run seed:campgrounds
```

Adds three fictional demo destinations with sample contact details. Fixed IDs identify fixtures; repeated runs insert only missing IDs and preserve edited fixtures, unrelated campgrounds, and all bookings. This command requires only `MONGO_URI`, reports inserted/existing counts, and exits nonzero on failure. It does not reset the database. Names are not unique identities.

The API returns campground `id`, `name`, `address`, and string `telephone` only. Lists include `count` and an array in `data`, ordered by ID. Malformed IDs return 400; absent valid IDs return 404; missing/invalid credentials return 401 before ID validation.

## Manage your bookings

POST `/api/v1/bookings` with `campgroundId`, `checkIn`, and `checkOut` (`YYYY-MM-DD`). Check-in must be today or later in Asia/Bangkok; check-out is 1–3 calendar days later. Ownership comes from your token. Overlaps and more than three bookings are allowed.

GET the collection or an individual ID to view your bookings and campground details. PUT an ID with a nonempty subset of those three fields; the complete resulting stay must satisfy date rules on every update. Historical stays remain readable/deletable and can be rescheduled, but campground-only edits preserving past dates fail. DELETE an ID permanently removes your booking. Administrators can list, inspect, edit, and delete anyone’s bookings; creation always books for the authenticated account.

The [booking Postman collection](postman/bookings.postman_collection.json) generates dates and two users, checks cross-user denial, and cleans up its bookings. See [run instructions](postman/README.md).

## Provision an administrator

From `backend/`, supply `ADMIN_NAME`, `ADMIN_TELEPHONE`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` through your local environment or ignored `.env`, alongside `MONGO_URI`, then run:

```sh
npm run setup:admin
```

All four administrator fields are required; there are no default credentials. Use a password of at least 8 characters and at most 72 UTF-8 bytes. Contact fields are trimmed, email is lowercased, and passwords are preserved exactly and hashed with bcrypt. The command needs no JWT/HTTP settings. Existing emails cause failure without changing the account, including an existing administrator. Failures exit nonzero and print a sanitized message.

Log in through `POST /api/v1/auth/login` and send the returned Bearer token to `POST /api/v1/campgrounds` with `name`, `address`, and `telephone`. Each must be a nonempty string; surrounding spaces are trimmed and unknown fields rejected. Success returns 201 with the persisted public campground in `data`, immediately visible through browsing. Missing/invalid authentication returns 401, ordinary users receive 403, and invalid fields return 400. Public registration cannot create administrators.

Keep credentials out of shell history and exports. See the [Postman instructions](postman/README.md) for the administrator creation scenario.

## Check the API

From `backend/`:

```sh
npm run typecheck
npm run build
npm test
```

Tests start a dedicated temporary MongoDB process and never use `.env` or Atlas. The first run may download a MongoDB binary and needs network access. Tests clean up their temporary database/process.

Import the collection and environment in [postman](postman/README.md), or run from the repository root with an installed Postman CLI:

```sh
postman collection run postman/auth.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

Use a designated test database: each collection run creates one ordinary user and preserves existing accounts. After seeding, run the browse collection using the same environment:

```sh
postman collection run postman/campgrounds.postman_collection.json -e postman/local.postman_environment.json --no-report-events
```

## Read first

- [Tickets 01–09](docs/tickets/README.md): implementation checklist and work order.
- [Requirements](docs/requirements.md): what to build and submit.
- [Architecture](docs/architecture.md): stack and folder structure.
- [API](docs/api-contract.md): implemented authentication/logout, campgrounds, and owner/administrator bookings.
- [Verification](docs/verification.md): what must pass.
- [ADRs](docs/adr/README.md): why we chose each technology.
- [Glossary](GLOSSARY.md): project terms.

Detailed agent notes live in `.agents/context/`. You do not need to read them for daily work.

Repository: [campground-booking-404hi](https://github.com/santa-nathawat/campground-booking-404hi)
