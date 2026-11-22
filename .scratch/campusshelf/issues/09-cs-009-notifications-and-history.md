# 09: CS-009 In-App Notifications + History

**What to build:** In-app notification center notifying users of key lifecycle changes (request received, request accepted, handover marked complete, dispute raised), verified donation history for donors and recipients, and public campus impact metrics.

**Blocked by:** 08: CS-008 Simplified Handover Completion + Dispute

**Status:** ready-for-review

- [x] Prisma schema includes `Notification` model with read/unread tracking
- [x] Notifications triggered on: request submitted, request accepted/declined, handover completed, and reservation expired
- [x] User profile displays verified donation history (books given and books received)
- [x] Public campus impact dashboard displays verified handover count (distinguishing listed, reserved, and completed)
