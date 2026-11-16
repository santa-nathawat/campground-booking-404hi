# 03: Provision an administrator and create campgrounds

Status: Plan approved; not started. Not published or labeled in an external tracker.

Human summary: [ticket 03](../../../docs/tickets/03-admin-create-campgrounds.md). This file retains detailed acceptance criteria.

## What to build

A team member can provision an administrator who logs in and adds a campground through the API.

## Acceptance criteria

- [ ] Provide a controlled, documented administrator setup command with explicitly supplied credentials; no fallback login, source-coded secrets, or public role escalation.
- [ ] Provisioned administrators can log in through the ordinary authentication flow and successfully create a campground through POST.
- [ ] Unauthenticated callers and ordinary registered users cannot create campgrounds. Public registration remains limited to ordinary users.
- [ ] Validate required campground fields and return the created persisted destination. It becomes visible through campground browsing.
- [ ] Test administrator setup through its command and administrator creation/ordinary-user denial through HTTP. Add a sanitized Postman administrator creation scenario.

## Blocked by

02: Seed and browse campgrounds after login
