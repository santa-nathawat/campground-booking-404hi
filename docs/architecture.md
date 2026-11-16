# Architecture

**Status:** app/server setup, shared middleware, auth/campground modules, and the campground seed script are implemented. Bookings and administrator provisioning remain planned.

## Stack

TypeScript, ECMAScript modules, Express, Mongoose, MongoDB Atlas, and JWT authentication.
See [ADRs](adr/README.md) for reasons.

## Folders

```text
backend/src/
  app.ts
  server.ts
  config/
  middleware/
  scripts/
  modules/
    auth/
      auth.routes.ts
      auth.controller.ts
      auth.service.ts
      auth.test.ts
      user.model.ts
    campgrounds/
    bookings/
```

Each module owns one route group and follows the same file pattern.
A route group contains several endpoints, such as register, login, and logout.

| Part | Job |
| --- | --- |
| Routes | Connect paths, middleware, and controllers. |
| Controller | Read HTTP input and send HTTP responses. |
| Service | Apply business rules and access data. |
| Model | Define Mongoose schemas and database operations. |
| Middleware | Authenticate, check roles, validate input, and handle errors. |
| Scripts | Seed campgrounds and provision administrators. |

`app.ts` assembles the app. `server.ts` validates configuration, connects to Atlas, then starts listening.

## Models

- **User:** name, telephone, unique email, password hash, role.
- **Campground:** required trimmed name, address, telephone strings; public reads expose these fields plus `id`. Fixed seed IDs identify fictional demo fixtures.
- **Booking:** owner, campground, check-in, check-out.

Keep each model in its owning module. Keep tests beside the code.

## Guardrails

- Load the current user after verifying JWT. Use the current stored role.
- Set booking owner from the authenticated user, never the request body.
- Scope ordinary users' booking queries to their own records.
- Keep passwords, tokens, and Atlas credentials out of Git.
- Never carry over Assignment 7's fallback administrator or signing secret.

Date-only storage as `YYYY-MM-DD` is proposed. Count calendar nights, not elapsed local-time hours.
Past bookings remain viewable/deletable. A campground-only edit preserves unchanged past dates; changing dates revalidates both.
