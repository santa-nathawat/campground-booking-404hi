# Requirements

**Status:** agreed business rules. Ticket 01 authentication is implemented; remaining features are pending.

## Users and bookings

| ID | Required behavior |
| --- | --- |
| FR-01 | Register with name, telephone number, email, and password. |
| FR-02 | Log in with email/password. Log out. |
| FR-03 | List campgrounds and book a stay of 1–3 nights. Each campground shows name, address, and telephone. |
| FR-04 | Users view their own bookings. |
| FR-05 | Users edit their own bookings. |
| FR-06 | Users delete their own bookings. |
| FR-07 | Administrators view anyone's bookings. |
| FR-08 | Administrators edit anyone's bookings. |
| FR-09 | Administrators delete anyone's bookings. |

## Agreed rules

- Login required for campgrounds and bookings.
- Use check-in/check-out dates in the Thailand calendar (`Asia/Bangkok`).
- Check-in today or later. Check-out 1–3 days later.
- Apply date rules when creating bookings or changing dates.
- Owners and administrators may change the campground and dates. Booking ownership stays fixed.
- Administrators may create their own bookings under the same rules.
- No booking-count limit. Overlapping bookings are allowed. No capacity or pitch tracking.
- Public registration creates ordinary users. A setup command creates administrators.
- Administrators can create campgrounds through POST. No campground update/delete endpoints.
- Seed command adds missing demo campgrounds. Re-running it must preserve existing campgrounds and bookings.
- Use JWT authentication. Logout clears client credentials; a copied JWT remains valid until expiry.

## Quality and scope

- Keep bookings private. Never return password hashes.
- Each request must respond within 3 seconds. Record actual test conditions.
- Build REST APIs backed by MongoDB Atlas. The team provisions Atlas.
- Test through Postman. No frontend or extra-credit features planned.

## Submit

One presentation file. No separate report required.

- Assigned problem and changes from Assignment 7.
- Use-case diagram, REST UML Profile class diagram, and sequence diagram.
- Team work split with GitHub Contributors evidence.
- Extra-credit list: **None**.
- Project GitHub link. Link larger diagram images if needed.

Demo the real program separately with Postman Runner or Newman.
The course slides allow 7 minutes presenting and 3 minutes for questions; check newer announcements.
