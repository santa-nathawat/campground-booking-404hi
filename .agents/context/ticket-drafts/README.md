# Approved ticket breakdown

Status: plan approved. Tickets 01–07 are implemented and locally verified; tickets 08–11 are not started. No external issues published. Tickets 01–09 have concise human summaries in [docs](../../../docs/tickets/README.md). Detailed acceptance criteria and tickets 10–11 remain here.

Source: [implementation spec](../campground-booking-spec.md). Each feature includes HTTP-level tests and incremental Postman evidence. No frontend is required.

| Ticket | Blocked by | Delivers |
| --- | --- | --- |
| [01: Register, log in, and verify identity](01-register-login.md) | None | A visitor can register, log in, and prove their identity through the API using a persisted account and JWT. |
| [02: Seed and browse campgrounds after login](02-seed-browse-campgrounds.md) | 01 | A logged-in user can browse real campground records created by a repeatable development/demo seed command. |
| [03: Provision an administrator and create campgrounds](03-admin-create-campgrounds.md) | 02 | A team member can provision an administrator who logs in and adds a campground through the API. |
| [04: Create an owned one-to-three-night booking](04-create-booking.md) | 02 | A logged-in user can create a persisted campground booking for one to three nights under their own identity. |
| [05: Read only authorized bookings](05-read-bookings.md) | 04 | An ordinary user can list and inspect their own bookings without exposing another user's records. |
| [06: Edit a booking without changing its owner](06-edit-bookings.md) | 04 | A booking owner can change their campground or dates while ownership and stay rules remain enforced. |
| [07: Delete an owned booking](07-delete-bookings.md) | 04 | A booking owner can remove their booking while other ordinary users cannot delete it. |
| [08: Manage all bookings as administrator](08-admin-manage-bookings.md) | 03, 05, 06, 07 | An administrator can list, inspect, edit, and delete any user's booking while ordinary-user privacy remains intact. |
| [09: Log out and demonstrate JWT limits](09-logout.md) | 01 | A logged-in client can log out, remove its saved credential, and understand the accepted copied-token limitation. |
| [10: Verify the complete API demo and response times](10-verify-demo-timing.md) | 08, 09 | The team can run one reproducible API demonstration with full requirement coverage and honest response-time evidence. |
| [11: Prepare diagrams and the final presentation](11-presentation-evidence.md) | 10 | The team has the required presentation and diagram evidence and can deliver the live API demonstration. |

## Review and publication

The user approved all ticket sizes and dependencies, then requested readable local documentation for tickets 01–09. That work does not require external tracker setup. Run `/setup-matt-pocock-skills` only before external tracker publication; these detailed files remain agent context.

After approval, publish one issue per ticket in dependency order with the configured ready-for-agent label and native blocking links where available. If local Markdown is selected, use the configured per-ticket issue layout. Do not modify or close a parent issue.

Proposed API details remain proposals. Each affected implementation ticket must document the concrete convention it adopts and surface material scope conflicts; no ticket grants permission to invent new requirements.

External prerequisite: the team provisions Atlas and supplies local connection configuration. Do not commit credentials. There is no separate horizontal infrastructure ticket: the first runnable authentication slice establishes the minimum backend foundation.
