# 07: CS-007 Donor Request Inbox + Accept/Decline

**What to build:** Donor request management inbox to review pending requests, accept a chosen recipient's request (atomically transitioning the listing to `RESERVED` and closing competing requests), and establish a 72-hour reservation handover window.

**Blocked by:** 06: CS-006 Request a Donated Book

**Status:** ready-for-agent

- [ ] `GET /listings/:id/requests` allows authenticated owner to view all incoming requests
- [ ] `POST /requests/:id/accept` uses a database transaction to lock the listing as `RESERVED`, mark the request `ACCEPTED`, decline or notify competing requests, and start a 72-hour handover timer
- [ ] Concurrency check ensures simultaneous accept calls cannot double-book a single physical copy
- [ ] `POST /requests/:id/decline` allows donor to decline individual requests with status transition
