# CampusShelf — Donation-First Student Book Network

**Product Requirements Document + Technical Build Blueprint**  
PRD version 1.0 | 17 November 2026 | Free-tier student pilot

DONATION-FIRST STUDENT BOOK NETWORK

CAMPUS
SHELF

Product Requirements Document + Technical Build Blueprint

A book is counted as donated only after a real handover is confirmed.

Working name: CampusShelf (name and domain availability not yet checked)
PRD version 1.0  |  17 November 2026  |  Prepared for a free-tier student pilot

Inspired by the product workflows in Booklee; redesigned around donation-first behavior,
student trust, campus discovery, safe handovers and a zero-cost-first engineering approach.


## SECTION 00
Executive summary
The decision this PRD is asking us to make.

CampusShelf is a student-first, donation-led platform for giving educational books a second life. Students can donate books directly to other students or through platform-reviewed campus/NGO partners. Affordable resale is supported as a secondary path. The initial launch is intentionally narrow: one campus community and its nearby student network, not a nationwide marketplace.


| Product promise / A student should be able to find a useful book for free, pass an unused book to someone who needs it, or buy an affordable used copy - with a clear and safe handover process. |
| --- |


### Product decision
The home experience, ranking, primary calls to action and impact reporting will all prioritize donations. Sale listings remain available but visually secondary. The product will not take payment, arrange courier delivery or claim that an NGO donation is complete until the handover is actually confirmed.


### First release
Student sign-in and campus onboarding using a controlled pilot invite code.

Create and manage donation listings with book details, condition and photos.

Browse free books first; search by title, author, ISBN, course, semester and campus.

Request a donated book; donor accepts or declines. Only one active accepted request per single-copy listing.

Arrange a public campus handover and confirm receipt with a one-time code plus confirmation from both sides.

My Donations, My Requests and an in-app notification centre.

Basic reports, moderation and admin review.

Secondary for-sale listings and buyer enquiries, without platform payments.


### What is not in release 1
No payment gateway, escrow, shipping, live maps, real-time chat, native mobile app, AI recommendations or automated NGO logistics. These would add cost, compliance and operational complexity before marketplace demand is proven.


### Who this is for
Primary: college students who have used textbooks to donate, students who need affordable learning materials, and campus volunteers. Secondary: manually reviewed NGOs, libraries and community learning centres. First pilot assumption: Darrang College and the nearby student community in Assam, subject to permission and partner validation.


### Success definition
The north-star metric is completed book handovers per active campus per month. Listings, clicks and requests are leading indicators; they are not social impact. The MVP succeeds when real students complete safe handovers, recipients confirm receipt, and the community returns for another semester.


## SECTION 01
Reference product audit: Booklee
What we are learning from the supplied ZIP - and what we will not copy.

I inspected the supplied `booklee.zip`, including its README, setup guide, package.json, model files and selected API routes. The README describes Booklee as a web app for selling and donating second-hand books, with guest browsing, search/filtering, book details, profiles, favorites, orders, invoices/donation proofs, messaging and an NGO donation flow.

Source screenshot supplied by the user: Booklee homepage and donation/selling positioning.

Source screenshot supplied by the user: NGO donation details form.


| Booklee area | What the ZIP documents/contains | CampusShelf improvement |
| --- | --- | --- |
| Product idea | Donate and resell used books; browse without signing in; profiles and saved books. | Keep the mission and marketplace behavior; make donation the default. Add campus/course context. |
| Donation | Separate donation listing model and NGO request form. | Use one listing lifecycle and a structured, verified handover flow. Separate direct student donation from NGO partner collection. |
| Book metadata | Name, author, photo, condition, description, user/email/location; optional college/study. | Add ISBN/edition, course, semester, subject, quantity/bundle, campus and privacy-safe pickup zone. |
| Transactions | Sold/donated history and invoice/proof records. | Use accepted requests and handover records; count impact only after confirmations. |
| Identity | NextAuth providers in the supplied project. | Use server-validated identity. Do not trust client-supplied owner IDs or emails. |
| Stack | Next.js Pages Router, React 17, JavaScript, Mongoose/MongoDB; older packages. | Greenfield TypeScript application with React and Express, PostgreSQL and automated tests. |
| Operations | Book forms, NGO form, location/map views, admin/visitor profile. | Campus pickup points, admin-reviewed partner directory and safe handover; defer maps/logistics. |


### Static source audit findings
The supplied package.json has Next.js configured as `latest`, React 17 and JavaScript-era dependencies; it does not include TypeScript, a test script, lint script or type-check script.

The user model stores arrays of book IDs and contact/location fields. New product data should use relational ownership and separate entities for listings, requests and handovers.

The donation listing API accepts seller identity fields from the request body and persists them. Ownership should instead come from a server-validated authenticated session.

The delete-listing API looks up/deletes by listing ID while taking seller email from the request body; the new API must scope updates and deletes to the authenticated owner.

The original donated-book add handler contains a save block nested inside the missing-fields branch after a return, so that branch is unreachable.

The README describes an OTP for completing a sale/donation; the supplied project screenshots include a client-side verification flow. Our one-time handover code must be generated and verified on the server.

The original environment guide calls for OAuth provider secrets, a Mongo/Cosmos URI, SendGrid, Azure Cognitive Search and Mapbox. These add setup friction/cost; the new MVP avoids paid search/maps/email services.


| Reuse the product lessons, not the old implementation / The supplied Booklee ZIP has an MIT LICENSE. If you directly reuse code, preserve the required copyright and license notice. For this new portfolio build, the preferred path is a clean implementation using Booklee as a functional reference; do not reuse its brand, logo, photos or other assets without checking rights. |
| --- |

SECTION 02
Vision, positioning and product principles

Donation-first is a product rule, not just a green Donate button.


### Vision
Make educational books circulate among students and community learning organisations so that a useful book is not left unused when another learner needs it.


### Positioning
A student-powered educational book-sharing network: donate first, request for free, exchange where useful, and buy affordable used copies when a donation is not available.


### Positioning statement

| CampusShelf / Give books a second life. Help another student learn. |
| --- |


### Product principles
Donation first: free books appear before paid listings in the main discovery experience.

Recipient dignity: requesting a free book is private and respectful; do not require people to publish why they need it.

Trust by design: user identity, listing ownership and handover state are verified on the server.

Campus-local first: prioritize safe, simple handovers over expensive shipping or maps.

Transparent impact: count only completed and confirmed handovers.

Low data collection: collect only what is required; never publish private phone numbers, email addresses or home addresses.

Mobile first: listing, browsing and request flows must work well on low-to-mid range Android phones.

Free-tier disciplined: no paid API or subscription may be required for the MVP.

Small vertical slices: implement one user-visible behavior at a time using incremental TDD.


### Product name and brand
CampusShelf is a working codename only. Before public launch, check trademark, social handles, domain availability and name similarity. Do not spend money on a domain for the first prototype; use the free hosting subdomain.


## SECTION 03
Problem, users and jobs-to-be-done
Whose problem are we solving first?


### Problem statements
Students finish a semester with books they no longer need, but cannot easily find the next learner who needs those exact editions.

Students need affordable textbooks but discoverability is fragmented across WhatsApp groups, seniors, local shops and informal posts.

Donation intentions are hard to verify: a listing or a form submission does not prove a book reached a recipient.

NGOs and community libraries may need specific titles or categories, while donors do not know what is currently useful.

Resale marketplaces focus on a transaction; a student community also needs free donation and trusted campus handover.


### Personas

| Persona | Primary goal | Pain / trust concern | Key product job |
| --- | --- | --- | --- |
| Asha - donor / senior student | Give semester books to someone who will use them. | Does not want endless messages or unsafe meetings. | List a book in under 3 minutes; choose a request; confirm handover. |
| Rohan - recipient / junior | Find required books without spending much. | Unsure whether edition/condition is right; free listings may be stale. | Search by course/semester; request; know when and where to collect. |
| Mira - seller | Recover some value from unused books. | Wants a fair local buyer; no complicated payment setup. | Post a priced listing; receive enquiry; arrange handover offline. |
| NGO partner coordinator | Find books matching a real learning-centre need. | Needs trust, quantities and traceable fulfillment. | Publish a request/campaign and confirm collections. |
| Campus ambassador | Run a semester book drive. | Needs a simple way to recruit donors and show verified impact. | Share a campus campaign and view completed handovers. |
| Platform moderator | Keep listings and users safe. | Spam, fake listings, disputes and misreported donations. | Review reports, verify partner profiles and suspend unsafe accounts. |


### Jobs to be done
When I finish a course, I want to donate books to students who need them so that the books are reused without friction.

When I need a textbook, I want to search by my subject, semester and campus so that I find a compatible edition nearby.

When I request a book, I want to know whether the donor accepted and how the handover will happen.

When I represent an NGO, I want to publish specific book needs and verify receipt so that the donation record is credible.

When I sell a book, I want a simple enquiry and campus handover without the platform needing to process payments.

SECTION 04
Goals, non-goals and release boundaries

Keep the first build focused enough to launch.


| Goal | Measure / expected outcome |
| --- | --- |
| Validate one-campus marketplace demand | At least 30 genuine donation listings and 20 genuine requests during pilot planning window. |
| Complete real donations | Initial target: 10 completed handovers in the first controlled pilot; target, not guaranteed result. |
| Support safe local exchanges | 100% of accepted requests have an in-app status and handover confirmation path. |
| Avoid false impact reporting | Impact counters include completed records only, not listings, impressions or accepted requests. |
| Be portfolio quality | Public demo, clean architecture, tests, CI, deployment, screenshots, documentation and transparent trade-offs. |
| Stay zero-cash-cost for pilot | Use free tiers and manual campus handover; do not introduce paid API dependencies. |


### Non-goals for MVP
No online payments, wallet, escrow, refunds or platform commission.

No shipping labels, courier integration, pickup fleet or delivery promise.

No native Android/iOS application; responsive web only.

No real-time chat or video calls; request messages and notifications are sufficient initially.

No AI recommendations, OCR, barcode scanning or LLM-based book matching in the first release.

No interactive map or precise geolocation; use campus and approximate pickup area.

No nationwide launch; start with one campus and a nearby student network.

No public exposure of private contact details or exact home addresses.

No unreviewed NGO partner badge; partner status must be manually reviewed.


### Release scope

| Release | Scope |
| --- | --- |
| MVP / campus pilot | Auth, campus onboarding, donation listing, free book discovery, requests, donor approval, safe handover, completed donation history, in-app notifications, reporting/moderation, basic sale listing and buyer enquiries. |
| V1.1 | Verified NGO directory, NGO needs/campaigns, campus book drives, exchange offers, semester bundles, saved searches. |
| V2 | Real-time messaging, advanced search, map view using an appropriate map provider, analytics, additional campuses and better operational tooling. |
| Later / only if justified | Payments/escrow through regulated providers, shipping, mobile apps, AI matching, automated pickup logistics. |


## SECTION 05
Roles, access and campus onboarding
A campus invite code is a gate, not identity proof.


| Role | Allowed capabilities | Restrictions |
| --- | --- | --- |
| Guest | Browse public available listings, search, view book details and public partner information. | Cannot create listings, request books or view private user data. |
| Student / member | Create donation/sale listings; request books; manage own listings/requests; confirm handovers; favorite; report. | May only edit/delete own active listings; cannot approve own request or change owner fields. |
| Campus ambassador | Student features plus share campaign links and view aggregated campus metrics. | Cannot access private member details or moderate reports unless separately granted. |
| NGO partner manager | Manage organisation profile and, after verification, create book-need campaigns and confirm partner handovers. | Cannot mark donations complete without the agreed confirmation workflow. |
| Moderator | Review reports, hide listings, suspend users and record moderation reasons. | Every sensitive action is audited; cannot modify unrelated user private data. |
| Platform admin | Manage campuses, invitation codes, partner verification and moderation roles. | Admin actions require stronger authentication and are logged. |


### Campus onboarding
1. User signs in with Google OAuth using Supabase Auth. A verified email from Google is not automatically proof of current enrollment at a particular college.
2. User chooses the campus and enters a campus invitation code issued by an administrator or approved campus ambassador.
3. Server validates that the code belongs to the campus, is not expired/revoked and has remaining uses. Redeem once per account; store only a hash of the code where practical.
4. Membership is marked `INVITED` or `COMMUNITY_MEMBER`; do not label the user “verified student” from the code alone.
5. Optional manual verification may later mark a member as campus-verified. If identity documents are ever collected, define retention, access and deletion rules before adding the feature.

| Trust label clarity / Display separate statuses such as “Campus member” and “Campus verified”. An invitation code can be shared or leaked; it is not equivalent to an official student-ID check. |
| --- |


## SECTION 06
Core user journeys
The product must make donation completion feel clear and safe.


### Journey A - donate a book to a student
End-to-end donation workflow.

1. Donor selects “Donate a book”, adds title/author/edition/ISBN if known, subject/course/semester, condition, description and up to five photos.
2. Donor chooses campus pickup area or an approved public meeting point; exact contact details remain private.
3. Listing is published as `AVAILABLE` after validation and moderation checks.
4. Recipient searches free books, opens the listing and submits a request with an optional short note.
5. Donor sees request details and accepts one request or declines. If accepted, the listing becomes `RESERVED`; other pending requests are closed or notified.
6. Both agree to a public campus handover time and place. Server creates a one-time handover token/code with expiry and stores only its hash.
7. Recipient enters the code at handover; donor and recipient confirm completion. If both confirm, listing/request/handover become completed atomically.
8. Only then is the event added to donor history, recipient history and verified impact counts.

### Journey B - request a free book
1. Open “Find free books”; donation listings are the default selection.
2. Filter by campus, course, semester, subject, title/author, edition/ISBN and condition.
3. Open book details: photos, condition, edition, general pickup area, donor profile trust label and availability.
4. Submit request; display clear rules: one request per user per listing, no guarantee until accepted, and no public phone/address disclosure.
5. Track `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED` or `COMPLETED` in My Requests.

### Journey C - donate to a verified partner
For MVP, partner onboarding is admin-managed. A donor can browse a verified partner profile and respond to a published book need only if the partner workflow has been activated. The platform does not arrange transport. The donor/partner agree on a campus/community collection point and both confirm receipt. Full NGO dashboards and campaigns are V1.1.


### Journey D - sell a used book
1. User creates a `SALE` listing with asking price in INR, condition and photos.
2. Buyer sends an in-app enquiry or request to reserve.
3. Seller replies and arranges an offline campus handover.
4. No payment is collected by CampusShelf in MVP; both users manage money directly and should use safe public handover practices.
5. The parties confirm the book handover; status becomes `SOLD` for listing history.

## SECTION 07
Functional requirements - MVP
Each requirement gets an ID so that specs, tickets and tests can trace it.


| ID | Requirement | Acceptance summary | Priority |
| --- | --- | --- | --- |
| FR-AUTH-01 | Sign in | Guest can browse. A member must authenticate before listing/requesting. Use Google OAuth via Supabase Auth. | P0 |
| FR-AUTH-02 | Session validation | Every private API request verifies the access token on the server. Client-supplied user IDs/emails never establish ownership. | P0 |
| FR-CAMP-01 | Campus selection | Member selects a campus and redeems a valid campus invite code. | P0 |
| FR-CAMP-02 | Campus labels | Show campus membership/verification status clearly; invite code alone is not verified enrollment. | P0 |
| FR-DON-01 | Create donation listing | Authenticated member can create a donation listing with title, author, optional edition/ISBN, category, condition, description, campus/pickup area and photos. | P0 |
| FR-DON-02 | Edit / withdraw | Owner can edit or withdraw own available listing. Reserved/completed listing has restricted edits. | P0 |
| FR-DON-03 | Donation-first ordering | Home and discovery default to free donations; paid listings are a secondary section/filter. | P0 |
| FR-DON-04 | Single physical listing | One listing represents one copy or clearly described bundle; avoid ambiguous stock counts in MVP. | P0 |
| FR-DISC-01 | Browse free books | Guest and member can browse public `AVAILABLE` donation listings with pagination. | P0 |
| FR-DISC-02 | Search and filters | Search title/author/ISBN and filter by campus, course, semester, subject and condition. | P0 |
| FR-DISC-03 | Listing details | Show book information, images, condition guide, campus pickup area, status and safe contact/request action. Hide private contacts. | P0 |
| FR-REQ-01 | Request a donated book | Authenticated user can submit one request per listing; owner cannot request their own listing. | P0 |
| FR-REQ-02 | Donor review | Owner can accept one request or decline requests. Only one accepted active request is allowed per single-copy listing. | P0 |
| FR-REQ-03 | Request lifecycle | Member can view request status and cancel their own pending request. State transitions are validated server-side. | P0 |
| FR-HAND-01 | Handover scheduling | Accepted parties agree to a safe public campus point and time; app stores only what is needed. | P0 |
| FR-HAND-02 | Secure completion | Server creates expiring one-time code; recipient enters it; donor and recipient both confirm. Code is hashed at rest and never logged. | P0 |
| FR-HAND-03 | Impact record | Create verified donation event only after both confirmations. Prevent duplicate completion and replay. | P0 |
| FR-USER-01 | My activity | Member sees own active listings, donation history, requests received and requests sent. | P0 |
| FR-NOTIF-01 | In-app notifications | Notify donor on request; requester on decision; both parties on handover/completion/cancellation. | P0 |
| FR-SELL-01 | Create sale listing | Member can create a sale listing with INR asking price; it is visibly secondary to donation. | P0 |
| FR-SELL-02 | Sale enquiry | Buyer sends an enquiry/reservation request; no online payment or escrow in MVP. | P0 |
| FR-MOD-01 | Report listing/user | Member can report suspicious/unsafe listing or user with reason. | P0 |
| FR-MOD-02 | Admin moderation | Moderator can hide/unhide listing, review reports, suspend account and record reason. | P0 |
| FR-NGO-01 | Partner directory | Display only platform-reviewed partner organisations. Status and what verification means are explicit. | P1 |
| FR-NGO-02 | Partner book needs | Verified partner can publish a structured request for book categories/titles/quantities after onboarding. | P1 |
| FR-NGO-03 | Partner handover | Donor and partner confirm collection through the same evidence-based completion workflow. | P1 |
| FR-EXCH-01 | Book exchange | Members can offer a book in exchange for another; requests and exchange acceptance use a separate flow. | P2 |
| FR-CAMP-03 | Campus drive | Admin/ambassador can create a semester campaign and share a public landing page/QR code. | P1 |
| FR-SHARE-01 | Share listing | A member can share a public listing link using the browser share sheet or copy link. | P1 |
| FR-IMPACT-01 | Campus impact | Display counts from completed donation events only; report listed/requested/completed separately. | P0 |

SECTION 08
Listing types, states and business rules

Keep the state model explicit so agents cannot invent inconsistent behavior.


### Listing types

| Type | Purpose | Important fields | MVP behavior |
| --- | --- | --- | --- |
| DONATION | Give the book free to another student or partner. | title, author, edition, ISBN?, condition, subject, course, semester, campus, pickup_area, images | Default discovery type; primary CTA and home section. |
| SALE | Sell an affordable second-hand book. | Same metadata + asking_price_paise (INR), negotiable flag optional. | Secondary navigation; enquiry and offline transaction only. |
| EXCHANGE (later) | Offer a book in return for another book. | Offered listing + wanted title/category + exchange request. | Do not implement until donation/request loop is validated. |


### Listing status model

| Status | Meaning | Allowed next states |
| --- | --- | --- |
| DRAFT | Owner is still editing. | AVAILABLE, WITHDRAWN |
| AVAILABLE | Visible and requestable. | RESERVED, WITHDRAWN, HIDDEN, EXPIRED |
| RESERVED | One request accepted; handover pending. | AVAILABLE (cancel/timeout), HANDOVER_PENDING, WITHDRAWN only via controlled cancel |
| HANDOVER_PENDING | A handover event/code exists. | COMPLETED, RESERVED/AVAILABLE if cancelled/expired |
| COMPLETED | Recipient and donor confirmations recorded. | Terminal; no edits to transaction facts. |
| WITHDRAWN | Owner removed listing. | Terminal except admin restoration policy. |
| HIDDEN | Moderator temporarily removed it. | AVAILABLE or REMOVED after review. |
| EXPIRED | Listing not renewed or reservation timed out. | AVAILABLE after owner reactivates, or terminal. |
| REMOVED | Admin deleted/removed for policy reasons. | Terminal; retain minimal audit record. |


### Request state model

| Status | Meaning / rule |
| --- | --- |
| PENDING | Waiting for donor decision. Only one pending request per user/listing. A listing may have several pending requests. |
| ACCEPTED | Donor selected this requester. Transactional update marks listing RESERVED and prevents another accepted request. |
| DECLINED | Donor declined; terminal. |
| CANCELLED | Requester or moderator cancelled before completion. |
| COMPLETED | Handover verified and both parties confirmed; terminal. |


### Critical invariants
A listing owner cannot request or accept their own listing.

The authenticated user ID comes only from a verified token, never from the request body.

Only listing owner or authorized moderator may change listing fields/status.

Only one accepted request can be active for a single-copy listing; enforce in a database transaction and/or unique partial constraint.

Handover codes are random, single-use, time-limited and stored as a cryptographic hash. Never log or expose them in analytics.

A completed donation must have both donor and recipient confirmation; a repeated request must not double-count impact.

Donation quantity and bundle semantics must be explicit. For MVP, one listing equals one book or one defined bundle.

Exact home address, phone and private email are never shown on public listing pages.

SECTION 09
Information architecture and required screens

Use Stitch to explore these screens before building production components.


| Route / screen | Purpose | Key states |
| --- | --- | --- |
| / | Donation-first home; mission, Find free books, Donate a book, featured donations, impact. | Guest/member; empty/loaded; campaign banner. |
| /auth/sign-in | Google sign-in and privacy explanation. | Loading, auth error, return URL. |
| /onboarding/campus | Select campus and enter invite code. | Invalid/expired/used code; membership status. |
| /books | Discovery defaulting to donations. | Search, filters, sort, pagination, empty results. |
| /books/:id | Book details and request action. | Available, reserved, completed, owner view, reported. |
| /donate/new | Donation listing form. | Draft, validation errors, photo upload progress, success. |
| /sell/new | Secondary sale listing form. | Validation, price INR, photo upload. |
| /dashboard | My listings, requests, donation history and quick actions. | Loading, empty, error, mixed statuses. |
| /requests/received | Donor reviews incoming requests. | Pending, accepted, declined, no requests. |
| /requests/sent | Recipient tracks own requests. | Pending, accepted, declined, completed, cancelled. |
| /handover/:id | Handover instructions and confirmation. | Code entry, expired code, donor/recipient confirmation. |
| /impact | Personal/campus impact with verified counts. | No impact yet; completed history. |
| /partners | Reviewed NGO/community partner directory. | No partners; verified/unverified display. |
| /admin/reports | Moderator queue and actions. | New/under review/resolved; audit log. |
| /admin/campuses | Manage campuses and invitation codes. | Create, expire, revoke, usage count. |


### Visual direction
Use a warm, optimistic, editorial campus aesthetic rather than a generic e-commerce template. The visual identity should feel trustworthy and community-driven: clear typography, generous white space, accessible contrast, book photography, calm green/blue accents and purposeful micro-interactions. The core action should remain obvious on mobile. Do not overuse gradients, glassmorphism or decorative animations that slow down low-end devices.


### Design states must be specified
Empty state: no donated books in the selected campus; show “Be the first to donate” and a secondary search change.

Loading state: skeleton cards and form upload progress.

Error state: actionable retry message; do not show raw stack traces.

Unavailable state: listing reserved/completed/withdrawn; explain next action.

Permission state: user cannot edit another member’s listing; hide owner controls.

Mobile state: navigation collapses, primary action reachable by thumb, filters in a sheet, forms use single-column layout.

Accessibility: keyboard navigation, visible focus, semantic headings, labelled fields, contrast and reduced motion.

SECTION 10
Google Stitch: design and prototype workflow

Yes - use Stitch. Use it as the design canvas, not the application backend.

Google describes Stitch as an AI-native design canvas that generates and iterates high-fidelity interfaces from prompts, images, code and voice; it supports multi-screen prototypes, design systems through DESIGN.md, and export/synchronization to developer tools including Antigravity. Google also documents a Stitch MCP workflow for connecting the design to Antigravity so an agent can fetch design context and implement a React UI. Product access, usage quotas and API/MCP requirements can change; verify the current terms and quotas in the Stitch account before assuming unlimited free use.

Recommended workflow: product requirements → Stitch prototype → design source → Antigravity implementation → visual verification.


### What Stitch should create for this project
Landing page: mission-led hero, Donate and Find Free Books primary CTAs, featured free books and verified impact.

Browse screen: donation-first segmented control; search; campus/course/semester filters; clear free/for-sale label.

Book details: photos, condition, edition, pickup area, donor trust label and request action.

Donation listing wizard: book details, condition guide, photos, campus/pickup area, preview and publish.

Request screen: request note, privacy explanation and clear pending state.

Donor inbox: requests, recipient status, accept/decline controls and handover instructions.

Handover screen: clear meeting details, one-time code process, two-party confirmation and safety tips.

Impact dashboard: completed donations, active listings and pending handovers shown as separate metrics.

Partner directory: platform-reviewed label, partner needs and collection process.

Responsive designs for 360px mobile, tablet and desktop; include loading, empty, error and unavailable states.


### Stitch-to-Antigravity sequence
1. Create one Stitch project for CampusShelf. Start with the user journey and visual direction, then generate 2-3 variants of the landing page and donation listing flow. Choose one direction before generating every screen.
2. Ask Stitch to create a consistent design system: typography, colors, spacing, radii, shadows, button variants, form controls, status badges and responsive behavior.
3. Export the design system as `.stitch/DESIGN.md` or the project root `DESIGN.md`. Treat this as the visual source of truth. Store screenshots/exports under `docs/design/`.
4. Connect the Stitch MCP server to Antigravity using the current official setup instructions. Keep API credentials in the tool’s secure configuration or environment, never commit them to Git or `AGENTS.md`.
5. Ask Antigravity to fetch the Stitch project/design metadata and write/update `docs/design/DESIGN.md` if needed. Review it before code generation.
6. Implement real React components using the project's component and architecture conventions. Do not copy a single giant generated HTML page into production.
7. Run the app, compare the browser output with Stitch, test mobile layout and accessibility, and refine. Stitch is the design reference; the running app is the behavior reference.

### Starter prompt for Google Stitch

| Design a donation-first student book-sharing platform called CampusShelf. / Audience: college students in India, starting with one campus. / Mission: give unused educational books a second life. Donations must / be visually primary; resale is secondary. / Create 3 genuinely different visual directions for the responsive / homepage and book discovery experience. / Must include: / - Primary CTA: Donate a Book / - Secondary CTA: Find Free Books / - Free books first; paid listings clearly secondary / - Campus, course, semester and subject filters / - Trust labels, condition tags and privacy-safe pickup area / - A verified-impact section counting completed handovers only / - Empty, loading and error states / - Mobile-first 360px layout and desktop layout / Style: modern editorial, warm, trustworthy, student-centered, / accessible contrast, strong book photography, restrained motion. / Avoid generic dashboard UI, excessive gradients and visual clutter. / Do not generate backend logic or claim real NGO impact numbers. |
| --- |


### Prompt for Antigravity after selecting a design

| Use the Stitch MCP to inspect the approved CampusShelf screens. / Read docs/design/DESIGN.md and the approved PRD. / Implement the selected design in the existing React + TypeScript app. / Keep components modular, accessible and responsive. Use sample data / only for prototype screens. Do not connect fake data to production APIs. / Do not change backend or database contracts unless the current ticket / requires it. Preserve the project architecture and Matt Pocock TDD / workflow. Build one vertical slice at a time and visually verify it. |
| --- |


| Stitch is not a free unlimited guarantee / The core design canvas may be available at no charge at the time of use, but do not assume every API/MCP action, quota or future feature is unlimited. Google’s Antigravity + Stitch codelab currently describes account setup and API-key prerequisites. Check your account’s current access/limits before depending on automated design generation. |
| --- |


## SECTION 11
Recommended technical architecture
A stack that fits your Express preferences and keeps the first pilot within free tiers.

Recommended: React + TypeScript frontend built with Vite; Express + TypeScript API; PostgreSQL hosted by Supabase; Supabase Auth for Google sign-in; Supabase Storage for book images. The API remains the authority for business rules and all sensitive writes. Browser code may use Supabase Auth and signed storage upload flows, but never receives a database password or service-role key.

Recommended zero-cost pilot architecture and the important free-tier limitations.


### Stack decisions

| Layer | Choice | Reason / implementation rule |
| --- | --- | --- |
| Frontend | React + TypeScript + Vite + Tailwind CSS | Works well with Stitch exports, modular components and Cloudflare Pages static hosting. |
| Routing/data | React Router + TanStack Query | Separate navigation from server state; cache listing/search results and mutation status. |
| Backend | Node.js + Express + TypeScript | Matches your learning stack and allows routes/controller/service separation. |
| Validation | Zod shared request schemas | Use schemas for API inputs and form validation; infer TS types where appropriate. |
| Database | Supabase PostgreSQL | Relational model for users, campuses, listings, requests, handovers and NGO partners. |
| ORM/migrations | Prisma (proposed) | Typed access and migrations; do not expose Prisma to browser code. |
| Auth | Supabase Auth + Google OAuth | Managed sign-in; API validates access token and maps `sub` to profile. |
| Image storage | Supabase Storage | One provider for database/auth/images; use a private/public bucket policy intentionally. |
| Testing | Vitest + Supertest + React Testing Library + Playwright | API integration, component behavior and a small set of end-to-end journeys. |
| CI | GitHub Actions | Run lint, type-check, tests and build on pull requests. |
| Frontend host | Cloudflare Pages Free | Static build; free build/file limits are appropriate for a small pilot. |
| API host | Render Free Web Service | Simple Express deployment; accept cold starts and ephemeral local disk for pilot only. |


### Why not MongoDB for this project?
Book sharing is relational: users own listings; listings receive requests; one request is accepted; a handover confirms the exchange; partners publish needs; moderation/report records reference users and listings. PostgreSQL constraints and transactions suit these relationships. MongoDB is still a good technology, but there is no strong reason to add it to this product when a free hosted Postgres option exists.


### Backend module structure

| apps/ / web/                         # React + Vite + TypeScript / api/                         # Express + TypeScript / src/ / modules/ / auth/ / profiles/ / campuses/ / listings/ / book-requests/ / handovers/ / notifications/ / partners/ / campaigns/              # V1.1 / moderation/ / middleware/ / lib/ / app.ts / server.ts / packages/ / contracts/                   # Zod schemas and shared API types / docs/ / product/PRD.md / design/DESIGN.md / architecture/ / decisions/ / runbooks/ / .agents/ / skills/                      # your project-local Matt Pocock skills |
| --- |


### Feature module responsibilities

| Layer | Responsibility |
| --- | --- |
| routes | HTTP method/path and middleware wiring only. |
| controller | Express Request/Response handling; call services; map result/errors to HTTP. |
| service | Business rules, transactions and use-case orchestration; no Express types. |
| schema | Zod request/query/params validation. |
| repository / database adapter | Optional only when useful; Prisma queries and transaction helpers. Do not add pass-through layers without reason. |
| model / Prisma schema | Database structure, relations, indexes and constraints. |
| test | Integration tests close to feature; tests for state transitions and ownership. |


## SECTION 12
Data model and relationships
Keep the database small, relational and traceable.

Simplified MVP entities. Detailed schema and constraints are specified below.


| Table | Purpose | Important fields / constraints |
| --- | --- | --- |
| profiles | Public/private member profile. | id = auth user UUID; display_name; avatar_url; campus_id; campus_status; account_status; created_at. Do not store public home address. |
| campuses | Approved campus directory. | id; name; city; state; country; slug; status. Unique normalized campus identity. |
| campus_invite_codes | Controlled onboarding. | id; campus_id; code_hash; max_uses; use_count; expires_at; revoked_at; created_by. Never store/log raw code. |
| listings | One physical book or one defined bundle. | id; owner_id; campus_id; kind DONATION/SALE; title; author; isbn; edition; subject; course; semester; category; condition; description; price_paise nullable; pickup_area; status; created_at; updated_at. |
| listing_images | Book image metadata. | id; listing_id; storage_path; sort_order; alt_text. Limit 5 images per listing; validate MIME/size. |
| book_requests | Interest/request for a listing. | id; listing_id; requester_id; message; status; created_at; decided_at. Unique active request per requester/listing. |
| handovers | Proof of local exchange/donation. | id; listing_id; request_id; donor_id; recipient_id; meeting_area; scheduled_at; code_hash; expires_at; donor_confirmed_at; recipient_confirmed_at; completed_at. |
| notifications | In-app events. | id; user_id; type; entity_type; entity_id; read_at; created_at. |
| partners | Verified NGO/library/community partner. | id; name; description; contact_private; public_contact; verification_status; verified_by; verified_at; status. |
| partner_campaigns (V1.1) | Structured book requirements. | id; partner_id; title; needed_titles/categories; quantity; campus/collection_area; start/end; status. |
| reports | Safety/moderation queue. | id; reporter_id; target_type; target_id; reason; details; status; moderator_id; resolution; created_at. |
| audit_events | Sensitive admin/state transitions. | id; actor_id; action; target_type; target_id; metadata_redacted; created_at. |


### Important database constraints
Foreign keys for owner, campus, listing, request and handover relationships.

Indexes on listings(status, kind, campus_id, updated_at); listings(owner_id, status); requests(listing_id, status); notifications(user_id, read_at).

Unique and transactional logic prevents two accepted requests for one listing. A transaction must re-check listing state before accepting.

Use `price_paise` integer for money; never use floating-point currency arithmetic. Keep `currency = INR` implicit or explicit.

Use UTC timestamps in database; format local display in browser.

Store one-time handover code hash only. Add expiry and used/completed state.

Use soft deletion or state transitions for moderation/history; avoid hard deletion of transaction/audit records.

Make listing and request completion idempotent so retrying a request cannot produce duplicate donation counts.


## SECTION 13
API surface and contracts
Versioned REST API; no API path is final until the spec/tickets are approved.

Base path: `/api/v1`. All protected endpoints require a valid Supabase access token. API derives the acting user from the token, not from `userId`, `ownerId`, `sellerEmail` or buyer details in the JSON body.


| Method + endpoint | Auth | Purpose / expected behavior |
| --- | --- | --- |
| GET /health | Public | Health check; no secrets or detailed infrastructure data. |
| GET /campuses | Public | List active campuses. |
| POST /campuses/redeem-invite | Required | Redeem invite code for selected campus; rate-limit attempts. |
| GET /me | Required | Return profile and campus membership state. |
| PATCH /me | Required | Update allowed profile fields only. |
| GET /listings | Public | Donation-first browse; query: kind, q, campusId, course, semester, subject, condition, cursor/page. |
| GET /listings/:listingId | Public | Details; hide private fields. |
| POST /listings | Required | Create DONATION or SALE listing; owner from token. |
| PATCH /listings/:listingId | Owner/moderator | Update allowed fields if listing state permits. |
| POST /listings/:listingId/withdraw | Owner/moderator | Withdraw own available listing. |
| POST /listings/:listingId/requests | Required | Request book; reject owner, duplicate or unavailable listing. |
| GET /me/requests/sent | Required | Requests made by current user. |
| GET /me/requests/received | Required | Requests for current user listings. |
| POST /requests/:requestId/accept | Listing owner | Accept one pending request transactionally; reserve listing; close/notify others. |
| POST /requests/:requestId/decline | Listing owner | Decline pending request. |
| POST /requests/:requestId/cancel | Requester/owner/moderator | Cancel only allowed states; record reason where appropriate. |
| POST /handovers/:handoverId/confirm-recipient | Recipient | Verify one-time code; record recipient confirmation. |
| POST /handovers/:handoverId/confirm-donor | Donor | Record donor confirmation; complete only when both confirmed. |
| GET /me/listings | Required | Current user listings and their states. |
| GET /me/impact | Required | Verified donation totals and history. |
| GET /notifications | Required | Paginated current-user notifications. |
| POST /notifications/:id/read | Owner | Mark own notification read. |
| POST /reports | Required | Report a listing or user. |
| GET /partners | Public | List platform-reviewed partners. |
| POST /admin/partners | Admin | Create partner record; verification remains pending. |
| PATCH /admin/partners/:id/verify | Admin | Record verification decision and evidence note. |
| GET /admin/reports | Moderator | Moderation queue. |
| POST /admin/reports/:id/resolve | Moderator | Resolve report with auditable action. |


### Request/response conventions

| POST /api/v1/listings / Authorization: Bearer <supabase-access-token> / Content-Type: application/json / { / "kind": "DONATION", / "title": "Discrete Mathematics", / "author": "Example Author", / "edition": "3rd edition", / "isbn": "9780000000000", / "course": "BCA", / "semester": 2, / "subject": "Mathematics", / "condition": "GOOD", / "description": "Some pencil marks; all pages intact.", / "campusId": "<campus-uuid>", / "pickupAreaId": "<approved-campus-point-id>" / } / 201 Created / { / "data": { "id": "...", "status": "AVAILABLE", / "kind": "DONATION", "title": "Discrete Mathematics" } / } |
| --- |

Error envelope: `{ "error": { "code": "VALIDATION_ERROR", "message": "Please check the highlighted fields.", "details": [...] } }`. Do not leak database error strings or stack traces. Use consistent 400/401/403/404/409/422/429/500 semantics.


## SECTION 14
Trust, safety, privacy and security
This is a community marketplace; safety is a product feature.


| Risk | Required control |
| --- | --- |
| Fake identity / invite sharing | Invite code rate limits, expiration, use limit, campus membership status, admin revocation and audit. Code does not claim verified enrollment. |
| Broken object-level authorization | Every read/write of private request/handover/profile data checks actor relationship and role on the server. Tests attempt cross-user access. |
| Forged owner/seller/buyer | Ignore owner IDs, emails and roles supplied by client. Derive actor from validated Supabase JWT. |
| Unsafe handover | Recommend public campus/library meeting points; hide phone/address until necessary; report/block; provide safety guidance. |
| Handover code replay | Cryptographically random, single-use, short expiry, hashed in DB, attempt throttling and atomic state transition. |
| Malicious image upload | Allowlist image MIME types, file-size and dimension limits, generated storage paths, signed policies, server-side checks where possible. |
| Spam / scraping | Rate limits on registration, listing creation, requests, reports and search; pagination; bot protection if abuse emerges. |
| Scam or prohibited listings | Report flow, moderator queue, prohibited-content policy, listing status audit and user suspension. |
| Personal data leakage | Public profile uses display name/avatar only; private contact is not included in public API DTOs; no exact home address. |
| Secrets exposure | Never commit OAuth secrets, DB URL, Supabase service role, Stitch API key or email provider keys. Use deployment secrets. |
| Admin misuse | Role checks, audit trail, least privilege, MFA/strong account protection for admins. |
| Legal/privacy obligations | Publish terms, privacy notice, deletion/contact process and donation disclaimers; review applicable Indian data protection/consumer obligations before public launch. |


### Donation integrity
Do not issue a “tax receipt” or imply tax deductibility. The platform is facilitating book handover, not accepting a monetary charitable donation.

A partner badge means the platform reviewed the organisation profile; it does not guarantee that every activity or cause is officially endorsed.

Impact dashboard counts only records with the required confirmations and audit event. Show listed, reserved, pending handover and completed numbers separately.

For disputed handovers, provide a report/dispute path and allow moderators to freeze an impact record while reviewing.

SECTION 15
Zero-cost-first technology and deployment plan

Free tiers are enough for development and a small pilot, not a promise of permanent production uptime.


| Budget assumption / Target cash spend for coding, prototyping and a controlled pilot: ₹0. This is achievable only by staying within free quotas, using provider subdomains, manual campus handover and no paid APIs. There may still be non-cash costs: internet, your time, devices, and volunteers. Any custom domain, email sender domain, paid quota, courier or event expense is outside the zero-cost assumption. |
| --- |


| Service | Free-tier fit / current published limits | Use in CampusShelf / caveat |
| --- | --- | --- |
| Google Stitch | Google’s product pages describe design generation, prototyping, DESIGN.md and Antigravity integration. Usage/quota/pricing details are not fully specified in the public sources checked. | Use current free access for UI exploration; verify account quotas and MCP/API-key requirements; no assumption of unlimited calls. |
| Supabase Free | Current pricing lists 500 MB Postgres, 1 GB file storage, 5 GB egress, 50,000 MAU and two active free projects; free projects can pause after about 7 days of low activity. | Use Auth, Postgres and Storage. Monitor quota; no automatic backups/PITR in Free. Not appropriate for a service that requires guaranteed uptime. |
| Cloudflare Pages Free | Current docs list up to 500 builds/month, one build at a time, up to 20,000 files and 25 MiB per static asset. | Host Vite React static frontend on a free `pages.dev` URL; no custom domain required. |
| Render Free Web Service | Free Node web services are available but spin down after 15 minutes idle; next request takes about a minute to restart. Local filesystem is ephemeral. | Host Express API for pilot/demo. Uploads must go to Supabase Storage; never save user files to Render disk. Cold-start is a known UX compromise. |
| GitHub Actions | Standard runners are free for public repositories; private repos have included usage depending on account plan. | Use CI for lint, type-check, tests and builds. Avoid overusing workflow minutes on every tiny generated artifact. |
| Resend (optional later) | Current pricing page lists Free with 3,000 emails/month and 100 emails/day. Sender-domain verification/setup may be required. | Do not make email a hard MVP dependency. Start with in-app notifications and Supabase Auth; add transactional email only when sender setup is possible. |
| Gemini API (optional AI later) | Google lists a free tier for selected models but rates, eligible models and data use differ from paid tier. | Do not put LLM calls in the critical donation flow. AI matching is a later experiment; user data must not be sent unnecessarily. |


### Important free-tier limitations
Supabase free projects can pause after a week of low activity. If people depend on the platform for a time-critical donation, a paid uptime plan or alternate hosting will eventually be necessary.

Render free web services sleep after 15 minutes without inbound traffic and can take about a minute to wake. Explain this during pilot; do not claim 24/7 service levels.

Render local files are ephemeral. Store uploads in Supabase Storage, not on the API server.

Supabase Free has no automatic backups/PITR as part of the listed free tier; export/backup important pilot data manually and communicate that this is an early pilot.

A free provider can change its quotas or acceptable-use terms. Review official pricing pages before public launch and monthly while the pilot runs.

Free-tier hosting is for a small portfolio/pilot. If the platform gains traction, budget for reliable hosting before users rely on it.


### No-cost deployment topology

| GitHub repository / \| / +-- apps/web  --> Cloudflare Pages (static React app) / \| / +-- apps/api  --> Render Free Web Service (Express API) / \| / +-- Supabase --> Auth + PostgreSQL + Storage / Public URLs (no paid domain): / https://<project>.pages.dev / https://<api-service>.onrender.com / Secrets: Cloudflare/Render environment settings only. / Do not commit .env, service-role key, DB password or Stitch API key. |
| --- |

SECTION 16
Engineering workflow: Matt Pocock skills + Antigravity

Use your existing workflow; do not invent another framework.

Design exploration is an input to the engineering workflow, not a substitute for implementation or tests.


### Recommended project lifecycle
1. Product discovery: interview students and NGO/library stakeholders; write decisions in the PRD and glossary if terminology is ambiguous.
2. Use `/grill-with-docs` for unresolved product decisions; interview one topic at a time and capture glossary/decision notes only when useful.
3. Use `/to-spec` to turn the agreed PRD slice into a behavior-focused specification with acceptance criteria.
4. Use `/to-tickets` to break the approved spec into small end-to-end vertical tickets. Each ticket should include API, UI and tests where needed, not just a database layer task.
5. For a UI-heavy ticket, use `/prototype` and Google Stitch to explore the page/flow. Approve a design direction and update the spec/ticket before production work.
6. Use `/implement TICKET-ID`. The original Matt implementation workflow and your project AGENTS.md should enforce strict incremental RED → GREEN → REFACTOR. Do not create all production modules before the first meaningful failing test.
7. Use `/code-review` and inspect the diff, test output, authorization logic and production behavior. Do not rely only on the agent’s final summary.
8. Only commit/push after your explicit approval under your existing workflow rules.

### Strict backend architecture for every new feature

| modules/<feature>/ / <feature>.routes.ts       # endpoints + middleware wiring only / <feature>.controller.ts  # Express request/response mapping / <feature>.service.ts     # use cases + business rules / <feature>.schema.ts      # Zod input validation / <feature>.test.ts        # integration tests close to module / Database schema / Prisma models stay in the shared database layer. / Add repository helpers only when they remove meaningful duplication. |
| --- |


### TDD rules for CampusShelf
Write a focused test for one observable behavior before implementing its production logic.

Run the test and confirm a meaningful behavioral RED, not merely a syntax or missing-import error.

Implement the minimum production code across as many modules as needed to make that one behavior pass.

Run the focused test and confirm GREEN; refactor; rerun the test.

For a new state transition, test both allowed and forbidden transitions.

For every private endpoint, include unauthenticated and cross-user/ownership checks.

Keep integration tests against an isolated test database. Reset fixtures between tests.

Never remove/skip/weaken a test just to make the suite green.


### What to add to the project root

| AGENTS.md / - TypeScript / feature-first conventions / - Routes / controllers / services separation / - Strict incremental TDD rules / - Security and approval expectations / - Use existing scripts; do not invent commands / .stitch/ or docs/design/ / - DESIGN.md, approved screen exports and screenshots / .agents/skills/ / - existing Matt Pocock project-local skills / - optional Stitch design/build skills after checking names / evals/ (later, not MVP requirement) / - agent workflow eval tasks and TDD trace rubric |
| --- |


## SECTION 17
Testing strategy and quality gates
Quality is defined by behavior, state transitions and security - not by code volume.


| Level | What to test | Examples |
| --- | --- | --- |
| Unit | Pure business rules and status transition policies. | Condition mapping; request eligibility; donation impact only after both confirmations. |
| API integration | Express + auth + validation + PostgreSQL. | Create listing; reject invalid title; reject owner requesting own book; accept only one request. |
| Database integration | Constraints, transactions and idempotency. | Concurrent accept attempts; no duplicate completed donation; foreign-key behavior. |
| Frontend component | User-visible behavior and accessibility. | Donation filter default; request button disabled when unavailable; validation and empty states. |
| E2E (Playwright) | Critical journeys across browser and API. | Donor lists book → recipient requests → donor accepts → handover confirms. |
| Security tests | Object-level authorization and role boundaries. | User B cannot edit User A listing; guest cannot request; member cannot access admin routes. |
| Manual pilot checks | Real campus and operations. | QR link works on Android; pickup point is clear; users understand donation vs sale. |


### Must-have test scenarios for donation flow
Create donation listing with valid fields and uploaded image metadata; assert owner from auth token.

Reject blank/whitespace title, invalid condition, too-long description and unsupported image metadata.

Guest cannot create/request; token expiry/invalid token returns 401.

Owner cannot request their own listing.

User B cannot view private request details or edit/delete User A listing.

Two recipients attempt to request simultaneously; only one accepted request can reserve the listing.

Donor accepts one request; listing moves AVAILABLE → RESERVED atomically; other requests are notified/closed.

Expired or reused handover code fails; code is never stored in plaintext or logged.

Only both confirmations complete a donation; repeated confirmation is idempotent.

A dispute/report can freeze the impact entry; it cannot create a duplicate donation count.

Completed donation appears in both user histories and campus impact aggregate exactly once.


### Quality gates

| Gate | Pass condition |
| --- | --- |
| Build | Web and API build from clean checkout. |
| Type-check | No TypeScript errors in apps/web, apps/api and packages/contracts. |
| Lint/format | Configured lint/format scripts pass; actual scripts inspected from package.json. |
| Tests | Focused tests and full relevant suite pass; no skipped test added to hide failure. |
| Security | Cross-user authorization tests pass; secrets not in source; upload policies verified. |
| Accessibility | Keyboard flow, form labels, focus visibility, contrast and reduced motion checked. |
| Visual QA | Stitch reference compared with real browser at mobile and desktop widths. |
| Operational | Environment variables documented; service wake behavior and Supabase pause caveats understood. |

SECTION 18
Initial ticket backlog: vertical slices

Start with the smallest complete user journeys. Final ticket IDs come from your issue tracker.


| Ticket | Name | Scope | Demo / acceptance outcome | Priority |
| --- | --- | --- | --- | --- |
| CS-001 | Workspace foundation + CI | Create React web app, Express API, shared Zod contracts, environment validation, GitHub Actions and health check. | No user feature; ensures clean local start and build. | P0 |
| CS-002 | Authentication + profile bootstrap | Google OAuth via Supabase Auth; API token validation; `/me`; basic profile; guest browse. | User can sign in/out and see their own profile. | P0 |
| CS-003 | Campus directory + invite code | Select one campus; redeem hashed invite code; admin create/revoke codes. | Invite cannot be reused beyond limits or after expiry. | P0 |
| CS-004 | Create donation listing | Form, Zod schema, image upload, listing persistence, owner view. | Authenticated donor publishes a valid book; owner is derived from token. | P0 |
| CS-005 | Donation-first browse + detail | Public feed sorted free donation first; search/filter; details; pagination. | Guest can find available books; no private data leaks. | P0 |
| CS-006 | Request a donated book | Recipient submits request; owner cannot request own listing; My Requests. | Request stored with PENDING state; recipient sees status. | P0 |
| CS-007 | Donor request inbox + accept/decline | Owner sees requests; accepts one; transaction reserves listing; declines others. | No double booking under concurrent attempts. | P0 |
| CS-008 | Safe handover confirmation | Schedule public pickup point; generate expiring hashed code; two-sided confirmation. | Completed donation counted once only after both confirmations. | P0 |
| CS-009 | In-app notifications + history | Notifications and My Donations/My Requests/Impact pages. | Users see relevant lifecycle changes and verified history. | P0 |
| CS-010 | Reports + moderator tools | Report listing/user; admin queue; hide/restore/suspend with audit event. | Moderator actions are role-checked and traceable. | P0 |
| CS-011 | Secondary sale listings | Create sale listing with INR price; filters and detail; label as For Sale. | Donation remains default; no payment processing. | P0 |
| CS-012 | Buyer enquiry + offline sale handover | Buyer sends enquiry/reservation; seller accepts; handover confirmation. | Sale transaction marked completed/sold; no in-app money movement. | P0 |
| CS-013 | Verified partner directory | Admin creates partner; stores review notes; public verified badge only after review. | Unreviewed profiles do not show verified badge. | P1 |
| CS-014 | NGO book needs / campaign | Verified partner publishes needed categories/titles and quantities; donors respond. | Campaign responses are linked to listing/handover. | P1 |
| CS-015 | Semester book drive + share links | Campus campaign landing page, QR/share link, aggregate verified impact. | Share page contains no private member details. | P1 |
| CS-016 | Book exchange offer | Offer one book in exchange for another with acceptance/handover flow. | Only after donation and sale flows stable. | P2 |
| CS-017 | Visual polish and responsive QA | Apply approved Stitch design system across screens; fix mobile, empty/error/loading states. | No layout overflow at 360px; keyboard and screen-reader checks. | P0 |


### Suggested dependency order

| CS-001 → CS-002 → CS-003 / CS-004 → CS-005 → CS-006 → CS-007 → CS-008 → CS-009 / CS-010 can run after CS-004/005. / CS-011 can run after CS-004/005; CS-012 after CS-007/008 patterns. / CS-013 → CS-014 → CS-015. / CS-016 is deferred until usage validates exchange demand. |
| --- |


| Do not create all tickets as giant layers / Each ticket should produce a demonstrable vertical slice. For example, CS-004 includes the form, API, database persistence, validation and tests for creating a donation listing - not just a database table. |
| --- |


## SECTION 19
Pilot launch and community operations
A donation marketplace is partly software and partly an offline process.


### First campus pilot
Working assumption: start with Darrang College as the first target campus, subject to permission and student interest. Keep onboarding invite-only for the pilot. Expand to nearby colleges only after one campus has a reliable supply/request/handover loop.


### Pre-launch checklist
Talk to at least 15 students: 8 potential donors and 7 likely recipients. Ask about actual recent book purchases, unused books and existing exchange channels.

Collect a small, permission-based supply catalogue before opening requests. Do not fabricate listings.

Identify 2-3 safe public handover points such as a campus library or staffed public area. Confirm whether college permission is required.

Recruit 2-3 student volunteers/ambassadors; define their role and moderation boundaries.

If using an NGO, verify the organisation, contact person, book acceptance rules, collection method and proof-of-receipt process.

Publish community rules, privacy notice, safe handover advice, prohibited listings and report contact.

Run one end-to-end test with two consenting test accounts before real users.

Create an incident process for scams, unsafe meeting reports, disputes and data deletion requests.


### Pilot targets (hypotheses)

| Metric | Initial target | Why |
| --- | --- | --- |
| Invitees | 50-100 students | Small enough to support manually. |
| Active donors | 15-20 | Enough supply to test demand. |
| Genuine donation listings | 30-50 | Initial catalogue, not a vanity count. |
| Book requests | 20+ | Check demand and match quality. |
| Completed handovers | 10+ | North-star behavior. |
| Request fulfillment | 40%+ initial target | Find whether supply matches demand; revise with real baseline. |
| Safety reports resolved | 100% reviewed within 48 hours during pilot | Small moderation queue must not be ignored. |


### Weekly operational rhythm
Review listing and user reports every day during pilot.

Contact donors with stale reserved handovers; expire old reservations rather than leaving inventory stuck.

Check failed image uploads and API errors.

Ask a few donor/recipient pairs about the handover process.

Publish a weekly aggregate impact update only from confirmed events.

Do not publish student names, emails or images without explicit permission.

SECTION 20
Growth loops, retention and product metrics

Make sharing useful, not spammy or manipulative.

A campus donation loop: completed value creates a reason for students to invite others.


### Growth mechanisms

| Mechanism | How it works | Guardrail |
| --- | --- | --- |
| Semester-end book drive | Campus campaign invites seniors to list books before new semester. | No false urgency or fake donation counters. |
| Shareable listing | Public book page with copy/share link and QR-friendly layout. | Do not reveal user private information. |
| Book request board | Students post book needs; new matching listings notify them. | Avoid exposing the requester’s personal story or contact details. |
| Campus ambassadors | Volunteers coordinate onboarding and safe pickup points. | No unrestricted access to member data or admin powers. |
| Verified impact badges | Members earn badges for completed donations. | Award only after confirmed handover; no pay-to-win. |
| Campus leaderboard | Aggregate completed donations by campus. | Normalize by active users or cohort size; avoid shaming low-supply campuses. |


### Product metrics definitions

| Metric | Definition |
| --- | --- |
| Completed donations (North Star) | Count of unique donation handovers with donor and recipient confirmations, not disputed. |
| Listing-to-request rate | Unique donation listings that receive at least one valid request / available donation listings. |
| Request fulfillment rate | Completed donation requests / accepted requests in the selected period. |
| Time to first request | Time from listing publication to first valid request. |
| Handover completion rate | Completed handovers / accepted requests. |
| Donor repeat rate | Donors who publish another donation in a later period / donors from earlier cohort. |
| Free-first discovery share | Donation listing detail views / all listing detail views. |
| Active campus liquidity | Active available donation listings + active book requests by campus. |


### How we could make it “viral” responsibly
Do not chase viral tricks. Build a repeated campus ritual: end-of-semester collection, beginning-of-semester discovery, request board, completed handover stories and a shareable campus impact page. The network grows when one student’s useful action is naturally relevant to the next semester’s students. Product-market fit and reliable supply are more important than referral popups.


## SECTION 21
Sustainability and future monetization
Keep the mission free for the first learner; do not monetize before trust.

The MVP should not process money. Students can arrange sale payments offline. Donation remains free. This avoids payment gateway fees, escrow complexity, chargebacks and financial compliance during the portfolio/pilot phase.


| Possible future model | When to consider | Caution |
| --- | --- | --- |
| College-sponsored book drives | After a campus proves completed handovers. | Keep donor/recipient access free; disclose sponsorship. |
| CSR / educational grants | After verified impact and partner relationships exist. | Never claim NGO endorsement or tax deductibility without basis. |
| NGO / library partner tools | When partners repeatedly use campaigns and reporting. | Do not charge small recipients by default; consider sponsor funding. |
| Optional campus services | When users request verified pickup/collection support. | Logistics has real cost; do not promise free delivery without funding. |
| Marketplace fees on resale (much later) | Only if volume and trust justify it. | Could undermine affordable access; test user willingness and legal/consumer obligations. |


## SECTION 22
Risk register and open decisions
What can go wrong before the first public release?


| Risk | Impact | Mitigation / decision |
| --- | --- | --- |
| Insufficient supply | Recipients search and see no useful books. | Pre-seed listings with real seniors; start with a campus/semester niche. |
| Insufficient demand | Books sit unused. | Interview recipients; request board; match course/edition; track time to first request. |
| No-shows / stale reservations | Listings become unavailable. | Reservation expiry, reminders and easy cancellation. |
| Unsafe in-person handover | Physical safety risk. | Public campus handover points; no home address display; report/block; safety guidance. |
| Fake donation impact | Trust and credibility collapse. | Two-party confirmation, audit event, deduplication and dispute freeze. |
| NGO misuse/fraud | Donors send books to untrustworthy entity. | Manual partner review, transparent badge, campaign review, admin suspension. |
| Photo storage quota exceeded | Uploads fail or incur cost. | Client-side resize/compress, 5-photo cap, storage quota dashboard, cleanup of abandoned uploads. |
| Free hosting cold start/pause | App feels unavailable. | Accept demo/pilot limitation; monitor; backup data; move to paid/alternate host when users rely on it. |
| Privacy or account compromise | Sensitive user information exposed. | Minimize data, verify object ownership, secure secrets, test access control, deletion and incident process. |
| Scope creep | MVP never launches. | No payments, shipping, real-time chat or AI recommendation until evidence supports them. |
| Student book legality/copyright | Photocopies/pirated material listed. | Policy requires genuine physical copies; moderation/report path; prohibit scans and pirated copies. |


### Decisions to validate before final spec
Confirm the first launch campus and whether college approval/permission is needed.

Confirm whether first pilot is 18+ only; avoid accounts for minors until privacy/safeguarding requirements have been reviewed.

Decide whether the first NGO workflow is manual admin-managed partner listings or direct NGO accounts; recommendation: admin-managed first.

Decide the first 2-3 public handover points and safety policy.

Decide condition labels and what books are prohibited.

Confirm whether a sale enquiry should reserve a listing or simply start a conversation.

Confirm the brand name, logo and domain only after checking availability.

SECTION 23
Repository setup and day-to-day build process

How this PRD becomes an actual product in your project folder.


### Suggested monorepo

| campusshelf/ / apps/ / web/ / src/ / app/ or routes/ / components/ / features/ / discovery/ / listings/ / requests/ / handovers/ / dashboard/ / lib/ / api/ / src/ / modules/ / auth/ / campuses/ / profiles/ / listings/ / book-requests/ / handovers/ / notifications/ / partners/ / moderation/ / middleware/ / lib/ / app.ts / server.ts / packages/ / contracts/ / prisma/ / schema.prisma / migrations/ / docs/ / product/PRD.md / product/specs/ / design/DESIGN.md / design/screens/ / architecture/ / runbooks/ / .agents/skills/ / .github/workflows/ / .env.example / AGENTS.md / README.md |
| --- |


### Local development commands (proposed)

| pnpm install / pnpm dev                  # run web + api locally / pnpm test                 # unit/integration tests / pnpm test:watch            # focused TDD loop / pnpm typecheck             # TypeScript checks / pnpm lint                  # lint all workspaces / pnpm build                 # production build / pnpm db:migrate            # Prisma migrations / pnpm db:seed               # local demo data only |
| --- |

These scripts are proposed names, not commands to run before the package.json is created. During implementation, the agent must inspect actual package scripts and update README. Local development should work without any paid provider by using a local PostgreSQL instance or a dedicated Supabase dev project.


### Recommended environment variables

| # apps/api / NODE_ENV=development / PORT=4000 / DATABASE_URL= / DIRECT_URL= / SUPABASE_URL= / SUPABASE_ANON_KEY= / SUPABASE_SERVICE_ROLE_KEY=      # server only; never expose to browser / SUPABASE_JWT_AUDIENCE=authenticated / APP_ORIGIN=http://localhost:5173 / # apps/web / VITE_API_BASE_URL=http://localhost:4000/api/v1 / VITE_SUPABASE_URL= / VITE_SUPABASE_ANON_KEY= / # Never commit real values. Use .env.example placeholders. |
| --- |


### Integration boundaries
Web app calls Express API for listings, requests, handovers, profile and moderation.

Web app uses Supabase Auth for sign-in and obtains the access token; API validates it before protected operations.

API uses Prisma with server-only database connection. Browser cannot connect with database credentials.

Image upload uses a controlled Supabase Storage bucket with policies/path scoped to the authenticated user. API stores the final storage path/metadata after verifying listing ownership.

In-app notifications are persisted in PostgreSQL and fetched through API. Email/push is deferred.

Stitch provides the UI visual reference and design tokens; it is not a runtime dependency of the shipped application.

SECTION 24
How this becomes a strong portfolio project

Build it so a hiring manager can inspect the product and the engineering behind it.


### Portfolio artifacts
Live public demo URL (with an honest pilot/demo label).

GitHub repository with clean commit history, issue tracker, PRs and CI workflow.

README with product problem, screenshots, user journey, architecture diagram, local setup and demo accounts.

PRD, data model diagram, API docs and short architecture decision records for meaningful decisions.

Automated test suite and CI badge; document test types and critical security tests.

Screenshots and a short walkthrough video demonstrating a completed donation from listing to handover.

A real pilot report: number of real listings, requests, completed handovers and lessons learned - only if measured with consent.

A “security and reliability” section explaining ownership checks, handover code hashing, idempotency, image storage and free-tier limits.


### Resume bullet template (fill with measured facts later)

| Built and launched a donation-first student book-sharing platform / using React, TypeScript, Express and PostgreSQL. Implemented / authenticated campus onboarding, book listings, request/approval / workflows and two-party handover verification. Added automated / API integration tests, role-based ownership checks and CI. / Pilot results: [X] verified handovers, [Y] active students across / [Z] campus communities. / Only replace brackets with real measured results after the pilot. |
| --- |


### What makes it impressive
The project is not impressive because it has many pages. It becomes impressive when it demonstrates a coherent product mission, real users, careful relational data design, secure state transitions, tests that catch ownership failures, thoughtful UI, deployability, operations and measurable outcomes.


## SECTION 25
Build roadmap and launch gates
A sequence designed to reach a real pilot without building everything at once.


| Phase | Work | Exit gate |
| --- | --- | --- |
| 0 - Validate (1-2 weeks) | Student interviews, campus demand, book supply, safe handover points, potential partner discovery. | Real evidence of donor and recipient demand; one pilot campus selected. |
| 1 - Product/design (3-5 days) | Use Stitch for landing, browse, detail, listing form, request and dashboard variants; approve DESIGN.md. | Approved core screen flows and design tokens. |
| 2 - Foundation (1 week) | Monorepo, TypeScript, auth, database, storage, CI, local setup and health endpoint. | Clean clone installs, builds, typechecks and tests. |
| 3 - Donation vertical slice (2-3 weeks) | Create listing, browse/detail, request, donor approval, handover and history. | Two test users complete end-to-end donation in staging. |
| 4 - Trust + pilot readiness (1-2 weeks) | Moderation, notifications, report flow, privacy/safety, mobile QA. | No known critical ownership issue; admin can handle reports. |
| 5 - Controlled campus pilot (2-4 weeks) | Invite 50-100 students, seed real listings, support handovers manually, gather feedback. | At least several real handovers and clear retention/supply lessons. |
| 6 - Secondary resale (1-2 weeks) | For-sale listing and buyer enquiry; no payments. | Sale flow works without affecting donation-first UX. |
| 7 - NGO partner expansion (2-4 weeks) | Partner review, campaign needs, collection/handover workflow. | One partner completes a documented pilot with verified records. |


| Build timeline is a planning estimate / The duration depends on how much time you can devote, how quickly Stitch/design decisions settle, and whether real campus participants are available. We should not promise a launch date until the first campus validation is complete. |
| --- |


## SECTION 26
MVP release acceptance checklist
A release is ready only when these observable behaviors work.

☐ Guest can browse donation listings and the UI presents donations as the primary path.

☐ Member can sign in and campus membership is correctly represented.

☐ Valid donor can create a listing and see it in their dashboard.

☐ Public listing hides private email, phone and exact home address.

☐ Recipient can request an available listing; listing owner cannot request own listing.

☐ Donor can accept one request only; concurrent accept attempts cannot double-reserve.

☐ Requester and donor receive in-app notifications for state changes.

☐ Handover code is random, expiring, single-use, hashed and throttled.

☐ A donation appears in verified impact only after donor and recipient confirmations.

☐ User cannot edit/delete/read another user private records through ID tampering.

☐ Moderator can review reports and record decisions.

☐ Sale listings are clearly secondary; no payment endpoint or false escrow claim exists.

☐ App works on mobile and has proper loading, empty, validation, error and unavailable states.

☐ Build, type-check, lint and tests pass from a clean checkout.

☐ Deployment secrets are not in Git; image uploads use object storage, not local filesystem.

☐ README explains free-tier cold starts, free-plan inactivity, data backup limitations and how to report issues.

SECTION 27
Source notes and current service references

Separate facts from assumptions; re-check provider limits before deployment.


### Supplied Booklee source
Primary product reference: the user-supplied `booklee.zip`, containing the Booklee README, local setup guide, MIT LICENSE, package.json, MongoDB/Mongoose models and Next.js Pages Router API handlers. The reference repository is identified in its Git configuration as `https://github.com/Rajdip019/booklee`. This PRD uses the product workflows and screenshots as inspiration and records selected code-level observations from the supplied archive. It does not treat Booklee as a production-ready implementation.


### Google Stitch / Antigravity
Google Developers Blog, “From idea to app: Introducing Stitch, a new way to design UIs” (May 20, 2025): https://developers.googleblog.com/en/stitch-a-new-way-to-design-uis/ - prompt/image-based UI generation, variants, Figma paste and frontend code export.

Google Blog, “Introducing vibe design with Stitch” (March 18, 2026): https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-ai-ui-design/ - AI-native infinite canvas, design agent, DESIGN.md, voice and Antigravity integration.

Google Blog, “We’re introducing new ways to design in real time with Stitch” (May 19, 2026): https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-updates/ - design iteration, Antigravity export and publishing pathways.

Google Codelab, “Design-to-Code with Antigravity and Stitch MCP” (updated July 22, 2026): https://codelabs.developers.google.com/design-to-code-with-antigravity-stitch - setup and design context flow between Stitch and Antigravity.

Google Labs GitHub, Stitch Skills: https://github.com/google-labs-code/stitch-skills - skills for design generation, DESIGN.md, React component integration and utilities. Check current compatibility and required MCP setup before installing.


### Free-tier references checked on 17 November 2026
Supabase pricing: https://supabase.com/pricing - current free plan includes 500 MB database, 1 GB file storage, 5 GB egress, 50,000 MAU, two active projects; no automatic backups/PITR on Free according to the pricing comparison.

Supabase free project pausing: https://supabase.com/docs/guides/platform/free-project-pausing and https://supabase.com/kb/faqs/platform/free-project-pausing - Free projects may pause after about seven days of low activity.

Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/ - current Free limits include 500 builds/month, 20,000 files and 25 MiB maximum per site asset.

Render free deployment: https://render.com/docs/free - Free services are for testing/hobby projects; free web services sleep after 15 minutes idle, have ephemeral local disk and may be unavailable during cold start; free Render Postgres expires after 30 days.

GitHub Actions billing: https://docs.github.com/en/actions/concepts/billing-and-usage - standard GitHub-hosted runners are free for public repositories; private repo usage depends on plan allowances.

Resend pricing (optional email): https://resend.com/pricing - current published Free tier lists 3,000 emails/month and 100/day; sender setup and limits must be checked before use.

Gemini Developer API pricing: https://ai.google.dev/gemini-api/docs/pricing - free tier has limited model access and quotas; not required for MVP.


### Assumptions and limitations
Free-tier prices and limits are snapshots checked on 17 November 2026; providers can change quotas, terms and plan eligibility. The zero-cost goal is for development and a controlled low-volume pilot, not guaranteed indefinite production service. Legal and privacy notes in this PRD are product design precautions, not legal advice. Before a public launch, review applicable Indian data protection, consumer, e-commerce, child-safety, intellectual-property and NGO-partner obligations with qualified support.


| Final product principle / Build a trustworthy local book-donation loop first. Prove that books reach learners. Add resale, NGO campaigns, AI and nationwide operations only when students demonstrate that they need them. |
| --- |
