# Specification: CS-001 Workspace Foundation + CI

**Status:** ready-for-agent

## Problem Statement

When starting development on CampusShelf, engineers and autonomous agents need a clean, stable, and deterministic monorepo environment to build full-stack vertical slices. Without a verified workspace baseline, type contracts fall out of sync between frontend and backend, environment configurations drift across machines, broken builds bypass checks without automated CI, and initial development suffers from ad-hoc dependencies and inconsistent project conventions.

## Solution

A robust pnpm monorepo workspace containing a TypeScript React web application, a TypeScript Express backend API, a shared Zod contracts package, strict environment validation, an automated GitHub Actions CI pipeline, and a production-grade `/health` verification endpoint. This foundation proves clean local builds, strict typechecking across boundaries, automated testing execution, and continuous integration validation before any domain features are built.

## User Stories

1. As a platform engineer, I want a unified monorepo workspace, so that frontend, backend, and shared contract packages can be developed and maintained in a single synchronized repository.
2. As a backend developer, I want a shared contracts package with Zod schemas, so that API response and request shapes are enforced across both server and client without duplicate manual type definitions.
3. As a frontend developer, I want a preconfigured Vite React TypeScript setup with Tailwind CSS, so that student UI screens can be built rapidly with production styling conventions.
4. As an API developer, I want Express configured with thin routes, controllers, and services, so that every backend module adheres to feature-first architectural separation from day one.
5. As a site reliability engineer, I want a public `/health` endpoint on the API, so that monitoring tools, hosting providers, and deployment checks can verify application uptime, environment sanity, and system status.
6. As a frontend client, I want the web application to consume the shared health contract, so that the UI can verify and display API connectivity status without type drift.
7. As an engineer running the API locally, I want environment variables validated at startup via Zod, so that missing or malformed configuration fails loudly and immediately with actionable errors rather than runtime exceptions.
8. As a developer making code changes, I want a single root test command, so that all package unit and integration tests run predictably and report clear results.
9. As a developer making code changes, I want a single root typecheck command, so that TypeScript errors across any workspace package fail the build before execution.
10. As a maintainer reviewing pull requests, I want GitHub Actions to run typecheck, lint, test, and build workflows automatically, so that no broken code can be merged into the main branch.
11. As an autonomous agent implementing tickets, I want isolated package boundaries, so that vertical slices can be developed incrementally using strict test-driven development without unexpected cross-package regressions.
12. As a platform engineer, I want strict `.gitignore` configurations, so that node_modules, generated build output, local environment secrets, and OS cache files are never accidentally tracked in version control.

## Implementation Decisions

- **Monorepo Topology**: Use pnpm workspaces to manage `apps/web`, `apps/api`, and `packages/contracts`. Dependency hoisting and package linking are governed by pnpm workspace resolution.
- **Shared Contracts Architecture**: The shared contracts package exports immutable Zod schemas and derived TypeScript types for all data transfer objects (DTOs), starting with the health check response contract (`HealthResponseSchema`). Neither the web client nor the API may duplicate these DTO shapes.
- **Backend Architecture Separation**: The Express API follows feature-first organization. The health check module is implemented with thin routes (`health.routes.ts`), an Express request/response controller (`health.controller.ts`), a pure business logic service (`health.service.ts`), and a module schema referencing the shared contract (`health.schema.ts`).
- **Environment Validation**: Server environment configuration is parsed and validated on boot using a Zod schema before the Express HTTP server binds to the listening port. Missing or invalid variables log descriptive error messages and exit the process with code 1.
- **CORS and Middleware Foundation**: The Express API includes JSON body parsing and CORS middleware configured to allow requests from the frontend client domain and local development origins.
- **Frontend Architecture Setup**: The web app uses Vite with React and Tailwind CSS. The root shell component renders the foundational layout, navigation header, and a live health check status badge that consumes the API health endpoint.
- **Continuous Integration Pipeline**: A GitHub Actions workflow runs on every push and pull request against the default branch. The pipeline executes frozen lockfile dependency installation, monorepo typechecking, automated test suites, and application builds.

## Testing Decisions

- **Test Quality Definition**: Tests must verify observable external behavior through public module interfaces, not private internals or implementation details. Tests must withstand refactoring as long as the public interface and behavior remain stable.
- **Backend Integration Testing**: The primary backend seam is tested using Supertest directly against the Express application instance. Tests verify that `GET /health` returns HTTP 200, sets appropriate JSON content-type headers, and produces a payload adhering strictly to the shared health contract.
- **Frontend Component Testing**: The frontend seam is tested using React Testing Library to verify that the root shell component renders properly, displays application branding, and reflects system status.
- **Contracts Unit Testing**: Shared contracts are tested by asserting that valid payloads pass schema parsing and invalid payloads are rejected with structured Zod errors.
- **Strict TDD Compliance**: In accordance with project conventions, meaningful failing tests must be written and executed first (RED) before writing the minimal production code to pass them (GREEN), followed by refactoring.

## Out of Scope

- User authentication, Supabase Auth integration, and Google OAuth login (deferred to CS-002).
- Prisma database schema creation, migrations, and database connections (deferred to CS-002 and CS-003).
- Campus invite code generation and campus selection directory (deferred to CS-003).
- Book listing creation, editing, and photo uploads (deferred to CS-004 and CS-005).
- Docker containers or containerized deployment manifests.

## Further Notes

- The project adheres to a single-context domain model documented in `GLOSSARY.md`.
- Deployment targets are Cloudflare Pages for the frontend static build and Render Free Web Service for the backend Express API. All code in this foundation must support stateless hosting without depending on a persistent local filesystem.
