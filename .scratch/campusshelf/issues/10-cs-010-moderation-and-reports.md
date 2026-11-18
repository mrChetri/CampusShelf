# 10: CS-010 Reports + Moderator Tools

**What to build:** Community reporting on suspicious listings or users, an administrative moderation queue, and moderator actions to hide listings, suspend accounts, and record audit logs for every enforcement action.

**Blocked by:** 05: CS-005 Donation-First Browse + Detail

**Status:** ready-for-agent

- [ ] Prisma schema includes `Report` and `AuditEvent` models
- [ ] Authenticated members can submit a report on any listing or user with standard violation categories
- [ ] Moderator role-guarded endpoints (`/admin/reports`, `/admin/moderate`) allow reviewing open reports
- [ ] Moderators can hide listings or suspend users; actions are immutably logged in `AuditEvent`
- [ ] Hidden listings are automatically excluded from public search and browse feeds
