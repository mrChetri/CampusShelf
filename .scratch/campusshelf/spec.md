# Specification: CS-003 Campus Directory + Invite Code

**Status:** ready-for-agent

## Problem Statement

When students authenticate via Google OAuth, they exist only as an unverified `Registered User` without any collegiate affiliation. CampusShelf is designed strictly as a campus-scoped, trust-first book sharing platform where book exchanges happen in person on physical college grounds. If any authenticated user could immediately list or request books without affiliation, the platform would suffer from spam, out-of-region requests, and loss of campus safety. Students need an intuitive way to find their college directory entry and prove their affiliation using a college-distributed onboarding code, transitioning them into verified `Campus Member` status.

## Solution

A campus directory and cryptographically hashed invite code redemption system. Active colleges (launching with pilot campus **Darrang College, Tezpur**) are exposed via a public directory endpoint. Authenticated students in the `Registered User` state are guided to an onboarding view where they select their campus and enter an authorized `Campus Invite Code`. The backend verifies the invite code using SHA-256 hashing, enforces expiration dates and maximum redemption limits, and atomically elevates the user's role to `Campus Member` linked to their chosen campus.

## User Stories

1. As a visiting student or unregistered user, I want to view the list of participating campuses, so that I can see whether my college is part of CampusShelf.
2. As a `Registered User`, I want to select my college from a directory dropdown, so that I can initiate affiliation with my institution.
3. As a `Registered User` at Darrang College, I want Darrang College pre-selected as the default pilot campus, so that onboarding requires minimal effort.
4. As a `Registered User`, I want to enter a campus invite code provided by my student union or campus ambassador, so that I can prove my college affiliation.
5. As a `Registered User`, I want to see clear, inline feedback if I enter an invalid or non-existent invite code, so that I can check the code and re-enter it correctly.
6. As a `Registered User`, I want to receive an informative error if the invite code has expired, so that I know to request a fresh code from my campus representative.
7. As a `Registered User`, I want to receive an informative error if the invite code has reached its maximum allowed uses, so that I know why redemption failed.
8. As a `Registered User`, I want to see an immediate visual transition to `Campus Member` status upon successful code redemption, so that I know I am now authorized to participate.
9. As an authenticated `Campus Member`, I want my active campus name (e.g. "Darrang College") displayed alongside my membership badge, so that I have clear confirmation of my active `Campus Scope`.
10. As a `Campus Member`, I want future page reloads to remember my campus affiliation, so that I do not need to re-enter an invite code on every visit.
11. As a platform administrator, I want invite codes stored as cryptographic SHA-256 hashes rather than plaintext, so that database leaks or unauthorized database access do not expose valid codes.
12. As a platform administrator, I want invite codes to support configurable usage caps (`maxUses`) and expiration timestamps (`expiresAt`), so that distribution can be controlled per batch.
13. As a backend service, I want redemption requests to be atomic, so that concurrent redemptions cannot exceed the `maxUses` threshold.
14. As an API client, I want `GET /api/campuses` to return active campuses with `id`, `name`, `slug`, `city`, and `state`, so that the frontend can render rich college selection options.
15. As an API client, I want `POST /api/campuses/redeem-invite` to require a valid Bearer token, so that unauthenticated requests cannot redeem codes.
16. As an API client, I want `POST /api/campuses/redeem-invite` to validate request input against a strict Zod contract, so that malformed requests are rejected immediately.
17. As an API developer, I want all campus contracts shared via `@campusshelf/contracts`, so that web and API remain strictly synchronized in types and validation.

## Implementation Decisions

- **Domain Model Alignment**:
  - Strictly use terms from `GLOSSARY.md`: `Registered User`, `Campus Member`, `Campus Invite Code`, `Campus Scope`.
  - The redemption process permanently changes the user's role from `REGISTERED` to `CAMPUS_MEMBER` and assigns `campusId`.
- **Database Schema (`apps/api/prisma/schema.prisma`)**:
  - `Campus`: `id` (UUID), `name` (String), `slug` (String, unique), `city` (String), `state` (String), `active` (Boolean, default true), `createdAt`, `updatedAt`.
  - `CampusInviteCode`: `id` (UUID), `campusId` (UUID, relation to Campus), `codeHash` (String, SHA-256), `maxUses` (Int, default 100), `usedCount` (Int, default 0), `expiresAt` (DateTime, optional), `revoked` (Boolean, default false), `createdAt`.
  - Update `User`: add `campusId` (UUID, optional relation to Campus) and default role `REGISTERED`.
- **Cryptographic Code Hashing**:
  - Plaintext invite codes entered by students are normalized (trimmed, uppercased) and hashed using standard Node.js `crypto.createHash('sha256')`.
  - Database queries match `codeHash` against stored hashes; plaintext codes are never persisted or logged.
- **Shared Contracts (`packages/contracts`)**:
  - `CampusSchema`: Zod schema for public campus metadata (`id`, `name`, `slug`, `city`, `state`).
  - `CampusesResponseSchema`: Array of `CampusSchema`.
  - `RedeemInviteInputSchema`: Zod schema with `campusId` (UUID) and `code` (string, min 4, max 32).
  - `RedeemInviteResponseSchema`: Zod schema containing `success: boolean`, `message: string`, and updated `user: UserProfileSchema`.
- **Backend Architecture (`apps/api/src/modules/campus/`)**:
  - Feature-first structure:
    - `campus.routes.ts`: `GET /campuses` (public), `POST /campuses/redeem-invite` (protected by `authMiddleware`).
    - `campus.controller.ts`: Translates HTTP requests and invokes service methods.
    - `campus.service.ts`: Queries active campuses, verifies invite code validity (hash match, expiration, revoked status, usedCount < maxUses), atomically increments `usedCount`, and updates user's `role` and `campusId`. Does not depend on Express types.
    - `campus.schema.ts`: Re-exports validation schemas from `@campusshelf/contracts`.
    - `campus.test.ts`: Supertest suite verifying all success and failure paths.
- **Frontend Experience (`apps/web`)**:
  - When an authenticated student has role `REGISTERED`, render an Onboarding Banner/Card:
    - College selection dropdown populated from `GET /api/campuses` (defaulted to Darrang College).
    - Invite code input field with submit button ("Join Campus").
    - Clear error messaging for invalid/expired codes.
  - Upon successful redemption, update local session context to reflect `CAMPUS_MEMBER` and display the campus name in the user header chip.

## Testing Decisions

- **Single Primary API Seam (`POST /api/campuses/redeem-invite`)**:
  - External behavior tested end-to-end via Supertest against the HTTP endpoint with authenticated bearer tokens.
  - Test valid invite code returns 200, updates role to `CAMPUS_MEMBER`, and attaches `campusId`.
  - Test non-existent code returns 400 with descriptive error message.
  - Test revoked code returns 400.
  - Test expired code (`expiresAt` in the past) returns 400.
  - Test exhausted code (`usedCount >= maxUses`) returns 400.
  - Test unauthenticated request returns 401.
- **Directory API Seam (`GET /api/campuses`)**:
  - Test returns 200 with list of active campuses matching `CampusesResponseSchema`.
  - Inactive campuses must be omitted from public results.
- **Contract Schema Unit Tests (`packages/contracts`)**:
  - Test `CampusSchema`, `RedeemInviteInputSchema`, and `RedeemInviteResponseSchema` validate correct data and reject malformed inputs.
- **Frontend UI Testing (`apps/web`)**:
  - Test `Registered User` sees campus selection and invite code form.
  - Test submitting code triggers API call and transitions UI to `Campus Member` upon success.
  - Test invalid submission displays user-friendly error message without crashing.

## Out of Scope

- Multi-campus switching or joining multiple campuses (a student belongs to one primary campus for MVP).
- Full self-serve admin portal for creating campuses (pilot campuses and initial invite codes seeded via migration/scripts).
- Geofencing or GPS location verification (physical presence verified via invite code distribution by campus ambassadors).

## Further Notes

- Pilot Campus: **Darrang College, Tezpur** (`slug: "darrang-college"`, `city: "Tezpur"`, `state: "Assam"`).
- Test Seed Codes: Provide a deterministic test invite code (e.g. `DARRANG-PILOT-2026`) in test environments and seeds for straightforward testing and demoing.
