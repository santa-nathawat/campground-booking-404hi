# ADR detail archive

Reference detail preserved before the readability edit. Current accepted ADRs live in `docs/adr/` at the repository root.

# ADR-0001: Use TypeScript

Status: Accepted

## Context

The Assignment 7 baseline and lecture examples use JavaScript. The team explicitly prefers TypeScript for the campground project, while retaining the JavaScript ecosystem used in the course.

## Decision

Write the backend application in TypeScript. This replaces the earlier recommendation to continue writing plain JavaScript. Module format is a separate decision and is not settled by choosing TypeScript.

## Consequences

Application contracts can be checked statically, but external HTTP input still requires runtime validation. The project needs a TypeScript configuration and a documented way to run and build the application. The baseline comparison must explain the language migration as well as behavioral changes. Compiler settings and tool versions remain to be selected.

---

# ADR-0002: Use Express

Status: Accepted

## Context

The baseline implements HTTP routes and authentication middleware with Express, which is also used in the lectures. The team has explicitly selected Express while requesting a different application organization.

## Decision

Use Express as the backend HTTP framework. Retaining it preserves familiar routing and middleware concepts while adapting the baseline to the campground requirements.

## Consequences

Existing Express behavior can be adapted, and the diagrams can retain recognizable HTTP and middleware flows. Request validation, authorization, and business rules still need explicit implementation. This choice does not settle module organization, persistence, or the framework version.

---

# ADR-0003: Use MongoDB Atlas

Status: Accepted

## Context

The project brief permits MongoDB Atlas or PostgreSQL. Assignment 7 already uses MongoDB through Mongoose. The team selected MongoDB Atlas and will provision the cluster and database.

## Decision

Persist application data in MongoDB Atlas rather than migrating to PostgreSQL. This retains the baseline's document database approach and follows the main MongoDB lecture path.

## Consequences

The application needs Atlas connection configuration and network access. The team is responsible for provisioning; application code must obtain credentials from the environment. Entity references, authorization, and stay validation must be implemented deliberately. This choice does not decide whether to retain Mongoose or use another MongoDB client.

---

# ADR-0004: Use ECMAScript modules

Status: Accepted

## Context

Assignment 7 uses CommonJS with `require` and `module.exports`. The team clarified that the requested module style means ECMAScript modules in the TypeScript application.

## Decision

Use `import` and `export` for backend source modules instead of retaining CommonJS source syntax.

## Consequences

TypeScript, package configuration, runtime execution, and test tooling must agree on module resolution. Existing CommonJS source requires adaptation. This decision does not select a particular build or test tool.

---

# ADR-0005: Use Mongoose

Status: Accepted

## Context

MongoDB Atlas is the chosen database platform. The baseline and MongoDB lectures use Mongoose; the alternative is using the MongoDB driver directly. The team accepted retaining Mongoose after discussing the purpose of models.

## Decision

Use Mongoose for persistence schemas, models, and database access.

## Consequences

Database shape and schema validation are represented by Mongoose models within their owning modules. TypeScript types and runtime request validation remain necessary; model validation alone does not enforce HTTP permissions or all business rules. The project retains an additional abstraction over the MongoDB driver and must keep its model types consistent with its stored data.

---

# ADR-0006: Organize backend modules by route group

Status: Accepted

## Context

The baseline puts the application in one server file. The lectures demonstrate global route/controller/model directories. The team wants related files together under `backend/src/modules/`, with each directory owning one route group.

## Decision

Organize the backend by route group. Each module contains its routes, controller, service, tests, and relevant models. Use `auth`, `campgrounds`, and `bookings` as the initial module groups. Shared middleware lives under `backend/src/middleware/`.

For example, `auth/` contains `auth.routes.ts`, `auth.controller.ts`, `auth.service.ts`, `auth.test.ts`, and `user.model.ts`. A route group can expose multiple endpoints; it is not a separate directory for every HTTP method/path pair.

## Consequences

Feature behavior and its tests are colocated. Routes wire HTTP paths and middleware, controllers translate HTTP requests/responses, services apply business rules, and models handle persistence. The implementation and sequence diagrams must reflect this service layer, which differs from the simpler lecture example. Modules must have clear ownership of shared data to avoid duplicated models and circular imports.

---

# ADR-0007: Use JWT authentication

Status: Accepted

## Context

The baseline and Chapter 8 use signed JWTs. The team wants to follow the taught authentication approach rather than introduce server-stored login sessions. Chapter 12 p13 explicitly identifies the limitation of removing a client token without revoking its server-side validity.

## Decision

Authenticate API requests using signed, expiring JWTs. Follow the lecture's logout approach by clearing client-held authentication credentials, including the saved Postman token and any authentication cookie issued by the API. Logout does not add a server-side JWT revocation mechanism.

## Consequences

Postman can authenticate using a Bearer token, and the implementation needs token verification middleware and separate authorization checks. Logout evidence must show client credential removal without claiming that a copied JWT becomes invalid. A copied JWT remains valid until expiry, assuming the signing key and other validation conditions remain valid. Secrets must be supplied through environment configuration. Exact expiry and cookie transport settings remain implementation configuration to document.
