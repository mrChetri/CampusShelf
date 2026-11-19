# Specification: CS-002 Authentication + Profile Bootstrap

**Status:** ready-for-agent

## Problem Statement

Students visiting CampusShelf need a secure, low-friction way to authenticate using their existing Google accounts without complex password setups. At the same time, prospective students and visitors must be able to explore available books as guests without being immediately forced behind a registration wall. Crucially, client-supplied identities (such as emails or user IDs in request bodies) cannot be trusted to establish ownership or permissions; the backend API must cryptographically verify every request using verified server-side session tokens.

## Solution

A dual-mode authentication and profile bootstrapping system powered by Supabase Auth with Google OAuth. Unauthenticated users browse freely as guests. When a student chooses to sign in, they authenticate via Google OAuth in the browser. The frontend obtains a JWT access token and passes it in the `Authorization: Bearer <token>` header to the backend API. An Express authentication middleware validates the token cryptographically on the server, creates or retrieves the student's profile in the database, and exposes a `/api/me` profile endpoint. The user begins in the `Registered User` state until they redeem a campus invite code.

## User Stories

1. As a visiting student, I want to browse public book listings without signing in, so that I can explore the catalog before deciding to register.
2. As a student, I want to sign in using my Google account with one click, so that I don't have to manage another set of credentials or passwords.
3. As an authenticated student, I want the system to automatically load my profile (name, email, avatar), so that I know I am properly signed in.
4. As a new user signing in for the first time, I want my profile automatically provisioned in the system with `Registered User` status, so that I can prepare to join my campus.
5. As an authenticated student, I want to see a visual indicator of my membership status in the navigation bar, so that I understand what actions I am currently eligible to perform.
6. As an authenticated student, I want to be able to sign out securely at any time, so that my account is not left active on shared or campus library computers.
7. As an API client, I want to send my access token via standard `Authorization: Bearer <token>` HTTP headers, so that the API can verify my identity on protected endpoints.
8. As a backend service, I want to verify JWT access tokens on the server, so that forged, expired, or tampered tokens are rejected with HTTP 401.
9. As a backend service, I want the user ID and email to be derived exclusively from the verified token payload, so that malicious clients cannot impersonate other users by sending fake IDs in the request body.
10. As a platform developer, I want a shared `UserProfileSchema` contract in `@campusshelf/contracts`, so that profile data shapes are identical across web and API.
11. As an API developer, I want an auth middleware that attaches the verified user payload to the Express request object, so that downstream controllers and services can cleanly access authenticated user information.
12. As a security engineer, I want public routes to remain accessible while private routes require valid bearer tokens, so that endpoints are protected according to the principle of least privilege.

## Implementation Decisions

- **Supabase Auth Integration**: Use `@supabase/supabase-js` on both web and API. The web client handles Google OAuth sign-in and session lifecycle; the API validates incoming bearer tokens.
- **Shared Profile Contract**: In `@campusshelf/contracts`, define and export `UserProfileSchema` and `UserRoleSchema` (values: `REGISTERED`, `CAMPUS_MEMBER`, `MODERATOR`, `ADMIN`).
- **Feature-First Auth/User Backend Module**:
  - `auth.middleware.ts`: Reusable middleware verifying `Authorization: Bearer <token>`. Returns `401 Unauthorized` with structured error response if token is missing, invalid, or expired.
  - `user.routes.ts`: Thin routing mounting `GET /me` (protected by `authMiddleware`).
  - `user.controller.ts`: Handles HTTP request and response for `/me`.
  - `user.service.ts`: Business logic to retrieve or bootstrap a user profile record given the verified token subject.
  - `user.schema.ts`: Re-exports profile schemas from contracts.
- **Database / Persistence Foundation**:
  - Introduce Prisma ORM in `apps/api/prisma/schema.prisma` with a `User` model (`id`, `email`, `fullName`, `avatarUrl`, `role`, `createdAt`, `updatedAt`).
  - Implement a Prisma client singleton helper in `apps/api/src/lib/prisma.ts`.
- **Frontend Auth State & Header Navigation**:
  - Implement Supabase browser client helper and auth context/hook managing user session.
  - Update root shell navigation header to render guest sign-in CTA or authenticated user profile chip with avatar, role badge, and sign-out button.
- **Environment Configuration**:
  - Update `apps/api/src/config/env.ts` to validate `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and optional `SUPABASE_JWT_SECRET`.
  - Provide a `.env.example` in repo root and `apps/api` documenting variables without committing secrets.

## Testing Decisions

- **Hermetic Testing Without Live External Services**: Automated test suites must run completely offline without relying on real Supabase network connections. Tests must verify the public boundary using mocked or token-signing test utilities.
- **Backend HTTP Seam (`GET /api/me`)**:
  - Test missing authorization header returns 401.
  - Test invalid or malformed bearer token returns 401.
  - Test valid bearer token returns 200 with payload matching `UserProfileSchema`.
  - Test user profile bootstrapping on first valid login.
- **Frontend Component Seams**:
  - Test unauthenticated guest state displays "Sign in with Google" button and guest browsing view.
  - Test authenticated session state displays user's name, avatar, `Registered User` badge, and sign-out button.
- **Contracts Unit Tests**:
  - Test `UserProfileSchema` parses valid user profile payloads and rejects invalid roles or missing fields.

## Out of Scope

- Campus directory selection and invite code redemption (deferred to CS-003).
- Creation and management of donation listings (deferred to CS-004).
- Email/password manual registration or custom OTP emails (using Google OAuth via Supabase Auth).
- Storage bucket file uploads (deferred to CS-004).

## Further Notes

- In accordance with `GLOSSARY.md`, newly authenticated users hold the `Registered User` role and are not yet labeled `Campus Member` until an invite code is redeemed in CS-003.
- Deployment targets remain Cloudflare Pages for `apps/web` and Render for `apps/api`. All authentication verification is stateless and JWT-driven.
