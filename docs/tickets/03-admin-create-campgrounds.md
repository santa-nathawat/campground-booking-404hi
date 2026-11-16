# 03: Create campgrounds as administrator

**Status:** Implemented and locally verified.
**Blocked by:** [02](02-seed-browse-campgrounds.md)

A provisioned administrator can log in and add campgrounds through POST.

## Done when

- [x] Provide a controlled administrator setup command. Read credentials from explicit local input or configuration.
- [x] Allow administrators to create campgrounds with required name, address, and telephone.
- [x] Deny unauthenticated callers and ordinary users. Public registration must never grant administrator access.
- [x] Persist the campground and show it in browsing results.
- [x] Test administrator setup through its command. Test creation and access denial through HTTP and Postman.
