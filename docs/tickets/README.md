# Implementation tickets

Approved plan. Tickets 01–02 are implemented and locally verified; tickets 03–09 are not started. No external issues have been published.

Each ticket includes its code, meaningful tests, and Postman examples. Test HTTP behavior against an isolated MongoDB database. Test setup commands directly.

| Ticket | Blocked by |
| --- | --- |
| [01: Register and log in](01-register-login.md) | None |
| [02: Seed and browse campgrounds](02-seed-browse-campgrounds.md) | 01 |
| [03: Create campgrounds as administrator](03-admin-create-campgrounds.md) | 02 |
| [04: Create a booking](04-create-booking.md) | 02 |
| [05: Read own bookings](05-read-bookings.md) | 04 |
| [06: Edit a booking](06-edit-bookings.md) | 04 |
| [07: Delete a booking](07-delete-bookings.md) | 04 |
| [08: Manage bookings as administrator](08-admin-manage-bookings.md) | 03, 05, 06, 07 |
| [09: Log out](09-logout.md) | 01 |

## Work order

1. Start 01.
2. After 01, work on 02 and 09 independently.
3. After 02, work on 03 and 04 independently.
4. After 04, work on 05, 06, and 07 independently.
5. Start 08 after 03, 05, 06, and 07 are done.

Independent tickets may still touch shared code; coordinate changes before merging.

The team provisions Atlas and supplies local connection settings. Never commit credentials.

Follow the [requirements](../requirements.md), [architecture](../architecture.md), and [ADRs](../adr/README.md). Exact API details marked proposed in the [API contract](../api-contract.md) still need implementation decisions.

Tickets 10–11 cover final demo/timing evidence and presentation/diagrams. They remain in agent context and are outside this folder.
