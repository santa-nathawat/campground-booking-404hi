# Campground Booking

Topic 2 project for 2110503 Software Development Practice.

Build a REST API for campground stays of 1–3 nights. Test with Postman. No frontend required.

**Status:** Tickets 01–02 authentication, campground browsing, and repeatable seeding are implemented and locally verified. Bookings, administrator setup/creation, logout, diagrams, and presentation remain pending.

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

Implemented endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `GET /api/v1/campgrounds`, and `GET /api/v1/campgrounds/:id`. Send `Authorization: Bearer <token>` for protected reads. Tokens expire after one hour.

## Seed demo campgrounds

From `backend/`, with `MONGO_URI` configured in `.env` or the environment:

```sh
npm run seed:campgrounds
```

Adds three fictional demo destinations with sample contact details. Fixed IDs identify fixtures; repeated runs insert only missing IDs and preserve edited fixtures, unrelated campgrounds, and all bookings. This command requires only `MONGO_URI`, reports inserted/existing counts, and exits nonzero on failure. It does not reset the database. Names are not unique identities.

The API returns campground `id`, `name`, `address`, and string `telephone` only. Lists include `count` and an array in `data`, ordered by ID. Malformed IDs return 400; absent valid IDs return 404; missing/invalid credentials return 401 before ID validation.

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
- [API](docs/api-contract.md): implemented authentication/campground reads and proposed remaining endpoints.
- [Verification](docs/verification.md): what must pass.
- [ADRs](docs/adr/README.md): why we chose each technology.
- [Glossary](GLOSSARY.md): project terms.

Detailed agent notes live in `.agents/context/`. You do not need to read them for daily work.

Repository: [campground-booking-404hi](https://github.com/santa-nathawat/campground-booking-404hi)
