# 01: CS-001 Workspace Foundation + CI

**What to build:** A clean monorepo development foundation with shared Zod contracts, a feature-first Express backend serving a verified `/health` endpoint, a Vite React web shell with Tailwind CSS, and an automated GitHub Actions CI pipeline.

**Blocked by:** None (can start immediately)

**Status:** ready-for-review

- [x] Monorepo workspace initialized with pnpm (`apps/web`, `apps/api`, `packages/contracts`)
- [x] Shared contracts package exports Zod schema and TypeScript type for `HealthResponse`
- [x] Express API mounts `GET /health` with routes, controller, service, and schema separation
- [x] Supertest integration test verifies `GET /health` returns HTTP 200 with contract-compliant payload
- [x] React web app builds with Vite and Tailwind CSS, rendering the initial CampusShelf shell
- [x] GitHub Actions CI workflow runs on PR/push: install, typecheck, test, and build
