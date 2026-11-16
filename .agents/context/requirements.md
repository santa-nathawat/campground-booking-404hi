# Requirements and acceptance checks

Status: source-backed requirements and team business rules agreed. The proposed API conventions and verification procedure are documented separately for final review. Tickets 01–07 local checks passed; see [booking evidence](bookings-implementation.md). see [authentication evidence](auth-implementation.md) and [campground evidence](campgrounds-implementation.md). See [administrator evidence](admin-campgrounds-implementation.md). Remaining acceptance checks are pending.

## Authority and scope

The Topic 2 brief, PDF page 6, defines functional requirements. Pages 2-3 define shared quality requirements and constraints. The instructor's submission instructions supplied in chat define presentation contents. Lecture examples guide implementation and notation; their VacQ business rules do not replace the campground brief.

Confirmed by the team: use repository `campground-booking-404hi`; write documentation in English; no extra-credit features are currently planned.

## Functional requirements

| ID | Required behavior | Planned acceptance evidence |
| --- | --- | --- |
| FR-01 | Register with name, telephone number, email, and password. | A valid registration succeeds; each required field is checked. Passwords are excluded from returned user data. |
| FR-02 | Registered users log in with email/password and can log out. | Valid credentials authenticate; invalid credentials fail. Verify the agreed logout behavior explicitly. |
| FR-03 | After login, book up to three nights at a chosen campground by specifying a date. Provide a campground list containing name, address, and telephone number. | Create valid stays of 1, 2, and 3 nights using check-in/check-out dates in the Thailand calendar. Reject past check-in, zero/negative duration, and stays longer than 3 nights on creation or every update (user decision during tickets 04–07). Verify listing fields. |
| FR-04 | Users view their own bookings. | With users A and B, A's list contains A's bookings and excludes B's. Check any single-booking and nested views too. |
| FR-05 | Users edit their own bookings. | A can edit A's booking; A cannot edit B's booking. Edited stays satisfy the same duration rule. |
| FR-06 | Users delete their own bookings. | A can delete A's booking; A cannot delete B's booking. Verify removal. |
| FR-07 | Administrators view any bookings. | An administrator can view bookings belonging to both A and B. |
| FR-08 | Administrators edit any bookings. | An administrator can change the campground and dates of bookings belonging to A and B. The same duration/date validation applies; ownership remains fixed. |
| FR-09 | Administrators delete any bookings. | An administrator can delete bookings belonging to A and B. |

Acceptance details beyond the literal brief, such as missing-field validation and protection against changing another user's booking, operationalize the stated requirements; they are not additional extra-credit claims.

## Quality requirements and constraints

| ID | Source requirement | Planned verification |
| --- | --- | --- |
| NFR-01 | Username/password authentication (brief p2); Topic 2 specifically identifies email/password (p6). | Use email as the login identifier; no separate username is required by Topic 2. Verify authentication failures. |
| NFR-02 | Keep users' transactions confidential (p2). | Exercise unauthenticated access and cross-user reads/writes; examine response fields and public campground data for booking leakage. |
| NFR-03 | Respond to a request within 3 seconds (p2). | Record per-request duration in Postman/Newman using the conditions in the verification plan. An average alone does not demonstrate this requirement. |
| NFR-04 | Use and test the system through Postman (p2). | Save and run a reproducible collection covering required behavior and authorization failures. |
| CON-01 | Implement a web API with REST APIs (p3). | Review the endpoint contract and exercise HTTP requests. |
| CON-02 | Frontend is not required (p3). | Deliver the backend and live API demo. |
| CON-03 | Use MongoDB Atlas or PostgreSQL (p3). | Select one in its own ADR and demonstrate persistence against that DBMS. |

## Initial access rights

| Operation | Unauthenticated visitor | Registered user | Administrator |
| --- | --- | --- | --- |
| Register / log in | Allowed | Allowed as applicable | Allowed as applicable |
| Create a booking | Denied | For self | For self, with the same date/duration rules (team decision) |
| Read bookings | Denied | Own only | Any |
| Edit/delete bookings | Denied | Own only | Any |
| List campgrounds | Denied (team decision) | Provided | Provided |
| Create campgrounds | Denied | Denied | Allowed through POST (team decision) |
| Edit/delete campgrounds | Outside agreed scope | Outside agreed scope | Outside agreed scope |

## Agreed interpretations and supporting behavior

- A booking has a check-in date and a check-out date. The check-out date ends the stay: December 1 to December 4 is three nights. The allowed duration is 1-3 nights per booking, without a separate booking-count limit.
- Multiple bookings may overlap at the same campground, including bookings from different users. Capacity, pitch inventory, and availability checks are outside scope.
- Campground listings require authentication.
- Supply initial development/demo campgrounds through a repeatable seed command. Re-running it adds missing seed records without deleting or replacing existing campgrounds or bookings.
- Support campground creation through an administrator-only POST endpoint. This is supporting project behavior, with no extra-credit claim. Campground update/delete endpoints are outside scope.
- Administrator accounts are provisioned through a controlled setup command. Public registration always produces an ordinary user.
- Interpret dates in the `Asia/Bangkok` calendar. Check-in may be today or later; check-out must be 1-3 calendar days after check-in. Apply this validation to creation and changes to booking dates.
- Booking owners and administrators may change a booking's campground and dates. The booking owner remains fixed. Administrators may also create their own bookings under the same rules.
- Use JWT authentication with client credential removal on logout. A copied JWT is not revoked and can remain valid until expiry. Test and document this limitation.

## Concrete design and verification

The [API contract](api-contract.md) proposes exact paths, fields, and HTTP status conventions. The [architecture](architecture.md) maps the agreed structure and data responsibilities. The [verification plan](verification.md) defines scenarios and evidence conditions. These are design documents, not claims of an implemented or tested system.

Accepted technical decisions are indexed in [decisions](decisions.md): TypeScript, Express, MongoDB Atlas, ECMAScript modules, Mongoose, route-group modules, and JWT authentication.

## Traceability

Every FR row is required by Topic 2, p6. NFR and CON rows come from pp2-3. Record eventual API operations, diagram references, and saved test evidence beside these IDs as the design and implementation become concrete. Planned checks above do not represent completed implementation.
