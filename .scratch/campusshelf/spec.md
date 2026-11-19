# Specification: CampusShelf — Donation-First Student Book Network

**Status:** ready-for-agent

## Problem Statement

Every semester, college students complete courses with expensive, reusable textbooks sitting idle on shelves or in hostels, while incoming junior students struggle to find affordable, course-compatible learning materials. Existing commercial marketplaces prioritize high-margin transactions, courier delivery, and online payments—creating cost barriers and friction for students who simply want to pass a book forward. Furthermore, unverified donation platforms count mere form submissions or listings as "donations", leading to phantom listings, unfulfilled requests, and lack of trust. Students need a zero-cost, campus-local, donation-first platform where textbooks circulate directly between verified campus peers with safe, transparent, in-person handovers.

## Solution

CampusShelf is a student-first, donation-led web platform designed for verified college communities, launching with a pilot at **Darrang College, Tezpur**. The platform prioritizes donation listings over secondary sales in search, browsing, and calls to action. Students authenticate via Google OAuth (`Registered User`) and join their institution using a cryptographically hashed, rate-limited `Campus Invite Code` (`Campus Member`).

Listing creation includes structured academic metadata (subject, course, semester, condition, and direct photos uploaded to Supabase Storage per ADR-0002). Requesters can claim available books; upon donor acceptance, the book enters a temporary 72-hour `Reservation`. The handover completes on physical campus grounds through a streamlined single-sided confirmation ("Mark as Donated" by the donor, with a "Report a Problem" dispute window for the recipient per ADR-0001). Social impact metrics reflect strictly verified handovers, and secondary sales remain an optional, cash-free peer interaction.

## User Stories

1. As a visiting student, I want to freely browse public book listings without signing in, so that I can explore available textbooks before creating an account.
2. As a student, I want to sign in using my Google account with one click, so that authentication is secure and passwordless.
3. As a new user, I want my profile automatically provisioned as a `Registered User`, so that my identity is established before joining a campus.
4. As an authenticated student, I want to view the directory of participating campuses and select my institution, so that I can affiliate with my college.
5. As a student at Darrang College, I want Darrang College pre-selected as the pilot default, so that onboarding is effortless.
6. As a student, I want to enter an authorized `Campus Invite Code`, so that I am elevated to `Campus Member` status with rights to donate and request books.
7. As a `Campus Member`, I want to create a book donation listing with title, author, edition/year, course, semester, condition, and pickup landmark, so that other students can easily identify compatible study materials.
8. As a donor, I want to upload book cover and page condition photos directly to cloud storage from my browser, so that the API server remains lightweight and zero-cost (ADR-0002).
9. As a student, I want donation listings to be prominently ranked above paid listings in the browse feed, so that zero-cost materials are always discovered first.
10. As a student, I want to search and filter available books by title, author, semester, course, and campus scope, so that I can quickly find the exact books I need.
11. As a `Campus Member`, I want to request an available donated book with a private note, so that the donor knows why I am requesting it without compromising my dignity or public privacy.
12. As a donor, I want an inbox of incoming requests for my listings, so that I can accept one student's request or decline with a brief note.
13. As a donor, when I accept a request, I want the listing to automatically enter a 72-hour `Reservation` status, so that no other student can claim it while our handover is pending.
14. As a donor and recipient, I want in-app notifications and status tracking, so that we both know when a request is accepted, reserved, or completed.
15. As a donor, after meeting the recipient on campus, I want to click "Mark as Donated", so that the handover is recorded as complete without requiring cumbersome OTPs or QR scanners (ADR-0001).
16. As a recipient, I want a "Report a Problem" dispute option if a book was falsely marked as donated or not transferred, so that platform integrity is protected (ADR-0001).
17. As a community member, I want the platform impact counter to reflect only verified completed handovers, so that impact metrics are honest and trustworthy.
18. As a student who needs to recover textbook costs, I want to list books for affordable secondary resale without platform fees or payments, so that local cash-on-handover deals can happen safely.
19. As a buyer, I want to submit a purchase enquiry for a for-sale book, so that the seller and I can coordinate an in-person exchange on campus.
20. As a campus administrator or ambassador, I want to review flagged listings and reported disputes, so that the platform remains free of spam, unauthorized commercial sales, and abusive behavior.
21. As a student, I want to view verified partner NGOs and community libraries, so that bulk donations and organized semester book drives can benefit local learners.

## Implementation Decisions

- **Architecture & Monorepo Topology**:
  - pnpm monorepo consisting of `apps/web` (React 18 + Vite + Tailwind CSS), `apps/api` (Express + TypeScript + Prisma), and `packages/contracts` (shared Zod schemas and TypeScript types).
  - Feature-first organization for all backend modules in `apps/api/src/modules/<feature>/` (`routes`, `controller`, `service`, `schema`, `test`).
- **Zero-Cost Free-Tier Deployment Infrastructure**:
  - Frontend hosted on Cloudflare Pages (static SPA build, unlimited bandwidth).
  - Backend API hosted on Render Free Web Service (stateless container, spinning down when idle).
  - Database & Auth & Storage hosted on Supabase Free Tier (PostgreSQL with Row Level Security, Google OAuth, and S3-compatible asset storage).
- **Domain Modeling & Glossary Rules**:
  - Strict conformance to [GLOSSARY.md](file:///E:/Xohai(Book%20Donation)/GLOSSARY.md): `Campus Member`, `Registered User`, `Campus Invite Code`, `Handover`, `Handover Completion`, `Dispute`, `Reservation`, `Expired Reservation`, `Campus Scope`.
- **Architectural Decision Records (ADRs)**:
  - **ADR-0001**: Single-sided donor handover confirmation ("Mark as Donated") with recipient problem reporting window; replaces mandatory OTP/QR handshakes for a fast, friction-free student experience.
  - **ADR-0002**: Direct client-side browser uploads to Supabase Storage with presigned tokens/credentials; avoids piping large image payloads through the Render Express API, preventing memory exhaustion.
- **Data Persistence Layer (`apps/api/prisma/schema.prisma`)**:
  - Centralized Prisma schema maintaining `User`, `Campus`, `CampusInviteCode`, `Listing`, `ListingPhoto`, `BookRequest`, `Handover`, `Dispute`, `Notification`, and `Report` entities.
- **Security & Integrity**:
  - Express `authMiddleware` validates JWT access tokens cryptographically via Supabase public keys/secrets.
  - Ownership enforcement: listing updates, deletions, and request acceptances are strictly scoped to the server-verified session identity (`req.user.id`).
  - Invite codes are stored as salted SHA-256 hashes with expiration and usage-cap enforcement.

## Testing Decisions

- **Test-Driven Development (TDD)**:
  - Strict adherence to RED → GREEN → REFACTOR for every observable behavior before committing.
- **Hermetic Backend Testing Seams (`apps/api`)**:
  - Supertest integration tests against Express route boundaries using in-memory or ephemeral test data.
  - Zero live external network calls to Supabase during test runs; mocked auth token generators produce valid test identities.
- **Frontend Component Seams (`apps/web`)**:
  - React Testing Library component tests validating user-visible states: guest browsing, authentication states, onboarding transitions, listing cards, reservation badges, and request forms.
- **Contract Boundary Testing (`packages/contracts`)**:
  - Vitest schema parsing tests ensuring every shared DTO validates correct payloads and fails loudly on invalid inputs.

## Out of Scope

- Online payment processing, payment gateways (Razorpay/Stripe), digital wallets, or platform commissions.
- Shipping logistics, courier integrations, automated parcel tracking, or delivery guarantees.
- Native mobile applications (iOS/Android); application is strictly mobile-first responsive web.
- Real-time peer-to-peer web chat or video calling (structured status updates, request notes, and notifications suffice).
- Live Mapbox/Google Maps integrations or GPS geofencing (replaced by campus names and campus pickup landmarks).

## Further Notes

- **Pilot Campus**: Darrang College, Tezpur, Assam (`darrang-college`).
- **Phased Implementation**: Delivered across 17 tracer-bullet vertical slices tracked in `.scratch/campusshelf/issues/` (`01` through `17`).
