# 04: CS-004 Create Donation Listing

**What to build:** An authenticated campus member can create a book donation listing with book metadata (title, author, ISBN/edition, condition, subject/course), select a safe campus pickup zone, upload up to 5 photos directly to Supabase Storage (ADR-0002), and manage their active listings in "My Listings".

**Blocked by:** 03: CS-003 Campus Directory + Invite Code

**Status:** ready-for-review

- [x] Prisma schema includes `Listing` entity with `AVAILABLE` state and relational user/campus links
- [x] Direct browser upload to Supabase Storage configured with bucket security policies
- [x] `POST /listings` endpoint validates listing payload with Zod and binds ownership to authenticated user
- [x] Frontend "Donate a Book" form with validation, image preview, condition guide, and submission state
- [x] Donor can view and withdraw their own available listings in "My Listings"
