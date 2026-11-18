# 05: CS-005 Donation-First Browse + Detail

**What to build:** Public discovery feed prioritizing free donations over sales, search by title/author/ISBN, filters by campus, course, semester, and condition, with detailed book modal/page that protects private user contact information.

**Blocked by:** 04: CS-004 Create Donation Listing

**Status:** ready-for-agent

- [ ] `GET /listings` endpoint supports text search, campus scoping (defaulting to member's campus), and filters
- [ ] Feed orders available free donations first, with clear badges and pagination
- [ ] Book detail view displays condition, photos, general campus pickup area, and trust label
- [ ] Private contact information (phone, email, full address) is hidden from public view
- [ ] Empty search states and loading skeletons match design standards
