# 08: CS-008 Simplified Handover Completion + Dispute

**What to build:** Agreed meeting location coordination, single-sided "Mark as Donated" completion action by the donor upon in-person handover (ADR-0001), atomic update to `COMPLETED`, and recipient "Report a Problem" dispute flow without requiring mandatory OTP or QR scanning.

**Blocked by:** 07: CS-007 Donor Request Inbox + Accept/Decline

**Status:** ready-for-agent

- [ ] Prisma schema includes `Handover` record linked to listing and request
- [ ] Donor and accepted recipient view agreed campus pickup area and schedule notes
- [ ] `POST /handovers/:id/complete` allows donor to click "Mark as Donated", atomically setting listing and request to `COMPLETED`
- [ ] `POST /handovers/:id/dispute` allows recipient to report an unfulfilled or false handover claim for moderator review
- [ ] 72-hour auto-expiration task/cron reverts unconfirmed reservations back to `AVAILABLE`
