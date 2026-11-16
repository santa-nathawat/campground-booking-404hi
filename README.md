# Campground Booking

Topic 2 project for 2110503 Software Development Practice.

Build a REST API for campground stays of 1–3 nights. Test with Postman. No frontend required.

**Status:** Ticket 01 authentication is implemented and locally verified. Campgrounds, bookings, administrator setup, logout, diagrams, and presentation remain pending.

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

Implemented endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, and `GET /api/v1/auth/me`. Send `Authorization: Bearer <token>` for `/me`. Tokens expire after one hour.

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

Use a designated test database: each collection run creates one ordinary user and preserves existing accounts.

## Read first

- [Tickets 01–09](docs/tickets/README.md): implementation checklist and work order.
- [Requirements](docs/requirements.md): what to build and submit.
- [Architecture](docs/architecture.md): stack and folder structure.
- [API](docs/api-contract.md): implemented authentication and proposed remaining endpoints.
- [Verification](docs/verification.md): what must pass.
- [ADRs](docs/adr/README.md): why we chose each technology.
- [Glossary](GLOSSARY.md): project terms.

Detailed agent notes live in `.agents/context/`. You do not need to read them for daily work.

Repository: [campground-booking-404hi](https://github.com/santa-nathawat/campground-booking-404hi)
