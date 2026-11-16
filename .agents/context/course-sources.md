# Course sources

Reviewed on 2026-11-16. PDF page numbers below are one-based physical pages. All 16 supplied lecture decks (550 pages) were reviewed using native text extraction, OCR for screenshot/scanned material, and visual inspection of the key Chapter 6 diagrams. Embedded lecture videos, external download links, and linked PlantUML source files were not reviewed.

## Source authority

1. The team's supplied instructor submission announcement controls presentation contents.
2. `../project-topic.pdf`, pp2-3 and p6, controls shared constraints and Topic 2 requirements.
3. The actual Assignment 7 commit controls the baseline comparison; see [baseline findings](assignment-7-baseline.md).
4. Lecture slides guide techniques and notation. VacQ example constraints and business rules apply to the example unless the campground brief also requires them.

Paths in the following table are relative to the parent project directory, outside this Git repository. Keep the page references if the PDFs are later moved or supplied separately. Missing decks are not assumed to have been reviewed.

## Complete supplied lecture inventory

| File under `../slide/` | Pages | Relevance |
| --- | --- | --- |
| `Chapter00_Intro_to_Course_69-336264-17841155149290.pdf` | 22 | Course scope, grading, presentation/demo requirements |
| `Chapter01_SRS_n_UI_2566-336264-16951818236841.pdf` | 21 | VacQ requirements, access rights, use cases |
| `Chapter02_DB_Design-336264-16728227820989.pdf` | 44 | Entities, keys, relationships, cardinality, normalization |
| `Chapter03_NoSQL_2565_JPG-336264-16728228045773.pdf` | 39 | Documents, Atlas, MongoDB CRUD/indexes/import |
| `Chapter05_Service_Architecture_n_HTTP-336264-16728228756658.pdf` | 9 | REST resources, HTTP methods/statuses |
| `Chapter06_NodeJS_Setup___GIT_2567-336264-17312124944100.pdf` | 48 | Node.js, Git/GitHub, development tools |
| `Chapter06_REST_API_n_JSON_n_API_testing-336264-17850549322961.pdf` | 34 | Express routes/controllers, REST UML Profile, sequences |
| `Chapter07.01_Postman_Env_n_Collections-336264-17388105301003.pdf` | 7 | Environments, collections, request documentation |
| `Chapter07.02_MongoDB_2565_JPG-336264-16728238430748.pdf` | 23 | Atlas connection, Mongoose schemas/models/CRUD |
| `Chapter08_Authentication_2569-336264-17895001352676.pdf` | 47 | bcrypt, JWT, cookies, authentication and role middleware |
| `Chapter09_Relationships_and_Authorization_2569-336264-17850598581634.pdf` | 61 | Querying, pagination, relations, ownership, CRUD authorization |
| `Chapter10_SQL_2568-336264-17508364857941.pdf` | 36 | PostgreSQL/Docker, SQL CRUD, joins, aggregates |
| `Chapter11_REST_with_RDBMS_2568_1-336264-17604239582456.pdf` | 22 | Node.js, Express and PostgreSQL with `pg` |
| `Chapter12_API_Security_Oct2026-360766-17911257226171.pdf` | 34 | Logout, sanitization, headers, XSS, rate limits, HPP, CORS |
| `Chapter13_OpenAPI_with_Swagger_Oct2026-360766-17911245372709.pdf` | 37 | OpenAPI, Swagger JSDoc/UI and endpoint schemas |
| `Chapter15_API_Testing_and_Monitoring_Oct2026-360766-17912605075632.pdf` | 66 | Assertions, Runner, monitors, Newman, reports, CI overview |

No separately named Chapter 4 or Chapter 14 deck was supplied. The Node/Git deck has a Chapter 6 filename; it is a separate deck from Chapter 6 REST.

## References to consult by task

| Task | Relevant PDF pages |
| --- | --- |
| Identify resources, actors, and permissions | Chapter 1 pp18-20; p19 access-rights matrix, p20 use-case diagram |
| Organize the backend | Chapter 6 REST pp7-10,22-29; Chapter 7.02 pp6-12 |
| Create the required REST UML Profile | Chapter 6 REST p32: Application, Resource, Representation, Path and HTTP stereotypes |
| Create sequence diagrams | Chapter 6 REST p33: server/router/controller/model/database request and response flow |
| Model persistence relationships | Chapter 2 pp19-26; Chapter 9 pp12-17,21-25,35-47 |
| Choose the taught MongoDB path | Chapter 7.02 pp3-10,23: Atlas and Mongoose |
| Choose the taught PostgreSQL path | Chapter 10 p7; Chapter 11 pp1-8: Express and `pg` |
| Implement credentials and access control | Chapter 8 pp3,8,17,21,26,32,43-44; Chapter 9 pp52-54 |
| Define logout behavior | Chapter 12 pp7-13, especially p13's explanation of JWT expiry |
| Order security middleware | Chapter 12 pp16,19,23,26,30,33-34 |
| Document APIs | Chapter 7.01 pp4-6; Chapter 13 pp14-37 |
| Save API assertions and chain requests | Chapter 15 pp8-22,27-40 |
| Share reproducible collections | Chapter 15 pp4,55-58; sanitize exported secrets |
| Prepare live demo | Chapter 0 p8; Chapter 15 pp55-63 for Newman/reporting |

## Adaptation cautions

- Chapter 1 p5 allows MongoDB Atlas or MySQL for the VacQ example. Topic 2 p3 instead allows MongoDB Atlas or PostgreSQL. Both MongoDB and PostgreSQL are taught; neither backend framework version nor MongoDB alone is mandated by the brief.
- Chapter 9 p52 limits nonadministrators to three appointments. Topic 2 specifies up to three nights. The actual submitted Assignment 7 differs again: three appointments per hospital. Keep these three rules distinct.
- Chapter 8 p10 accepts a role in tutorial registration. Public registration must not grant administrator powers by trusting a supplied role.
- Chapter 8 p43 uses 403 for role denial; Chapter 9 pp53-54 uses 401 for ownership denial. Agree on a consistent error contract instead of treating inconsistent examples as a single specification.
- Chapter 12 p13 explicitly says clearing the client token/cookie does not revoke a copied JWT. Document the behavior actually implemented.
- Chapter 12 pp16,30,34 notes compatibility adjustments for Express 5. Old screenshots do not establish a requirement to use Express 4, and dependencies should be checked when implementation begins.
- Chapter 13 p8's no-assignment/account-signup note concerns the SwaggerHub tutorial segment; it does not replace the project's required UML documents.
- Chapter 15 p34 warns that interrupted runners can leave created data behind. Plan reset/cleanup for repeated demos.
- Chapter 15 pp43-45 says cloud monitors require a reachable deployment. This guidance alone does not establish deployment as a Topic 2 requirement.
- Chapter 15 p56 warns that collection exports may contain tokens. Store sanitized reusable exports in Git.

## How to use these sources

Trace required behavior to the brief and team interpretations to accepted decisions. For presentation evidence, show the resulting implementation and saved checks. A technique appearing in a lecture is evidence that it was taught, not by itself proof that it is mandatory or eligible for extra credit.
