# Agent context

Detailed notes for agents. Human docs stay in `docs/`; the root README is the human entry point.

## Read by task

- Booking CRUD conventions, historical-edit decision, and local verification: [tickets 04–07 evidence](bookings-implementation.md).

- Authentication implementation, baseline mapping, and local verification: [ticket 01 evidence](auth-implementation.md).
- Campground read/seed conventions and verification: [ticket 02 evidence](campgrounds-implementation.md).

- Implementing approved slices: [detailed tickets](ticket-drafts/README.md). Human summaries cover tickets 01–09; external publication remains pending.
- Turning the project plan into tickets: [implementation spec](campground-booking-spec.md). Testing boundaries confirmed; tracker publication pending.
- Adapting Assignment 7: [baseline](assignment-7-baseline.md).
- Interpreting course requirements or diagrams: [course sources](course-sources.md).
- Checking interview answers or ADR conventions: [decision history](decisions.md).
- Preparing diagrams, presentation, or demo: [submission detail](submission.md).
- Checking requirement IDs and acceptance criteria: [requirements detail](requirements.md).
- Implementing modules and persistence: [architecture detail](architecture.md).
- Implementing requests, responses, or validation: [API detail](api-contract.md).
- Writing tests or collecting evidence: [verification detail](verification.md).
- Recovering longer ADR rationale: [ADR detail archive](adr-detail.md).

## Maintenance

Human-facing requirements and accepted ADRs are authoritative for current decisions.
These detailed notes preserve source evidence, interview history, implementation cautions, and proposed conventions.
A proposal is not an accepted user decision or an implemented feature.

When behavior changes, update affected human docs and detailed agent notes together. Resolve conflicts using explicit user decisions and source requirements.
Keep detailed evidence here; keep human docs concise. Do not require the user to read this folder or repeat the design interview.

- Administrator booking access and local verification: [ticket 08 evidence](admin-bookings-implementation.md).
