# 08: CS-008 Simplified Handover Completion + Dispute

**What to build:** Agreed meeting location coordination, single-sided "Mark as Donated" completion action by the donor upon in-person handover (ADR-0001), atomic update to `COMPLETED`, and recipient "Report a Problem" dispute flow without requiring mandatory OTP or QR scanning.

**Blocked by:** 07: CS-007 Donor Request Inbox + Accept/Decline

**Status:** ready-for-review

- [x] Prisma schema includes `Handover` record linked to listing and request
- [x] Donor and accepted recipient view agreed campus pickup area and schedule notes
- [x] `POST /handovers/:id/complete` allows donor to click "Mark as Donated", atomically setting listing and request to `COMPLETED`
- [x] `POST /handovers/:id/dispute` allows recipient to report an unfulfilled or false handover claim for moderator review
- [x] 72-hour auto-expiration task/cron reverts unconfirmed reservations back to `AVAILABLE`
