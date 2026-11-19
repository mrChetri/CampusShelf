# 03: CS-003 Campus Directory + Invite Code

**What to build:** Campus directory listing, selection of a primary college (starting with Darrang College), and onboarding via a cryptographically hashed, rate-limited campus invite code that promotes a `Registered User` to an authorized `Campus Member`.

**Blocked by:** 02: CS-002 Authentication + Profile Bootstrap

**Status:** ready-for-review

- [x] Prisma schema includes `Campus` and `CampusInviteCode` models
- [x] `GET /campuses` returns active pilot campuses
- [x] `POST /campuses/redeem-invite` validates hashed invite code, enforces expiration/usage limits, and transitions user to `Campus Member`
- [x] Frontend onboarding screen allows newly registered users to select their campus and enter invite code
- [x] Admin endpoint allows generating and revoking campus invite codes
