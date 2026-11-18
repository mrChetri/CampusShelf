# 06: CS-006 Request a Donated Book

**What to build:** An authenticated campus member can submit a request for an available donated book with an optional message note, while preventing duplicate requests, preventing owners from requesting their own books, and tracking requests in "My Requests".

**Blocked by:** 05: CS-005 Donation-First Browse + Detail

**Status:** ready-for-agent

- [ ] Prisma schema includes `BookRequest` model with `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `COMPLETED` states
- [ ] `POST /listings/:id/requests` validates request rules: member cannot request own book; one active request per user per book
- [ ] Requester can view their active and past requests with statuses in "My Requests"
- [ ] Requester can cancel their own pending request before donor decision
