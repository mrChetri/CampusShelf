# 14: CS-014 NGO Book Needs / Campaign

**What to build:** Verified partners can publish structured book requests by category, course, and quantity needed, enabling students to browse NGO needs and donate books directly to community campaigns.

**Blocked by:** 13: CS-013 Verified Partner Directory, 04: CS-004 Create Donation Listing

**Status:** ready-for-review

- [x] Prisma schema includes `CampaignNeed` model linked to `PartnerOrganization`
- [x] Partner manager can create and update book needs with target quantities
- [x] Students can view needed books and create a donation listing directly linked to a campaign
- [x] Partner handover flow marks campaign contribution fulfilled upon confirmed handover
