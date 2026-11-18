# CampusShelf

Donation-first student book sharing network for college campuses, prioritizing verified book handovers and zero-cost local circulation.

## Language

**Campus Member**:
A user who has authenticated and successfully redeemed a campus invitation code, granting permissions to publish listings, request books, and complete handovers.
_Avoid_: Verified student, enrolled student

**Registered User**:
A user who has authenticated via Google OAuth but has not yet redeemed a campus invitation code. May browse public listings and view profile, but cannot publish or request books.
_Avoid_: Guest, member, unverified student

**Campus Invite Code**:
A cryptographically hashed, rate-limited onboarding token tied to a specific campus that grants `Campus Member` status upon redemption.
_Avoid_: Promo code, referral code, coupon

**Handover**:
The physical in-person transfer of a reserved book between donor and recipient at an agreed public campus location.
_Avoid_: Delivery, shipping, courier

**Handover Completion**:
The act of the donor confirming the physical transfer by clicking "Mark as Donated", marking the listing and request as completed.
_Avoid_: OTP verification, two-sided confirmation

**Dispute**:
A flag raised by a recipient via "Report a Problem" when a book was falsely marked as donated or not physically transferred.
_Avoid_: Chargeback, refund claim

**Reservation**:
The temporary lock placed on an available book listing when a donor accepts a recipient's request, holding the listing for up to 72 hours for an in-person handover.
_Avoid_: Hold, booking, escrow

**Expired Reservation**:
A reservation that lapsed past the 72-hour handover window without completion, automatically reverting the listing to available status.
_Avoid_: Cancelled order, timeout

**Campus Scope**:
The default filter restricting a student's browse feed to listings within their registered campus, with optional expansion to view nearby campuses.
_Avoid_: Geofence, radius, zone



