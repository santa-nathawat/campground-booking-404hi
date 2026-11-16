# Assignment 7 baseline

## Immutable reference

- Repository: https://github.com/2110503-69CP/503cp69-a7-2-santa-nathawat
- Inspected commit: `fd409c2e38691f7adc8beb81a7767510fe3b4ade`
- Commit subject: `fix bug`
- Inspection date: 2026-11-16

The baseline was cloned outside this project for read-only inspection. Its application is `server.js`, with dependencies declared in `package.json`; classroom automation and a Postman collection are also present. No baseline tests have been run during this documentation task.

## Observed implementation

JavaScript/CommonJS on Node.js, Express, Mongoose, bcryptjs, jsonwebtoken, and dotenv. All application concerns are in one server file.

Existing capabilities include registration/login, hospital listing/detail/create/delete, appointment creation under a hospital, appointment listing/update/delete, and JWT-based route protection. Hospital creation/deletion requires the administrator role.

## Differences requiring attention

| Baseline observation | Campground project implication |
| --- | --- |
| Hospital and appointment vocabulary | Replace with campground and booking concepts consistently. |
| Appointment has date and hospital but no owner | Add booking ownership and enforce own-only access for ordinary users. |
| Authenticated users can list, update, or delete appointments without owner checks | Implement FR-04 through FR-09 authorization; authentication alone is insufficient. |
| Creation caps total appointments at three per hospital | Replace this with the agreed interpretation of the three-night stay requirement. It is neither the Topic 2 duration rule nor the lecture's per-user count rule. |
| Registration lacks telephone number | Add the required registration field. |
| No logout endpoint | Implement the agreed logout behavior. |
| Login includes an assignment-specific fallback administrator; JWT signing has a fallback secret | Provision real administrator data explicitly and require deployment secrets. Do not carry these shortcuts into the project. |
| Hospital responses populate appointment data | Prevent campground listing/detail responses from exposing users' private bookings. |
| One application file | Decide whether to reorganize into lecture-style routes/controllers/models. |

## Change evidence to maintain

For each implemented change, record: requirement ID, baseline behavior/file, resulting behavior/file, project commit or diff, and verification evidence. If a new implementation is chosen, explain that directly in the presentation and compare behavior against the preserved baseline commit. Do not claim unmodified baseline files as new work or invent a shared Git ancestry.
