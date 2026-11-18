# Personal Engineering Defaults

These are defaults, not a framework. Follow the existing project's conventions first. Do not restructure a working codebase just to match these preferences.

- Prefer TypeScript for new JavaScript/Node.js work when the project supports it. Do not convert an existing project unless asked.
- For backend features, prefer a feature-first layout that keeps the feature's routes, controller, service, validation/schema, model and tests close together when it fits the existing architecture.
- Prefer small functions and composition over classes unless a class clearly makes the design simpler or the project already relies on classes.
- Use the project's existing validation and test tools. For TypeScript API validation, prefer Zod when it is already installed or its use is part of the agreed change; do not add dependencies without a reason.
- Keep frontend work straightforward and focused on the product behaviour. Avoid elaborate styling or extra UI work unless requested.
- Explain important technical choices in plain language. Avoid introducing new frameworks, abstractions or workflow layers without a concrete benefit.
- Ask before committing, pushing, merging, deploying, deleting important data, creating paid resources, or making external issue-tracker changes. Show the intended action first.
- Test meaningful behaviour and run the existing type-check, lint and test commands where available. Do not invent test commands; inspect the project's scripts first.



## Backend Architecture Conventions

For Express + TypeScript backend modules, use
feature-first organization.

Each feature should keep its related files together.

- **Routes:** Define endpoints and connect middleware and controllers. No business logic.
- **Controllers:** Handle HTTP requests and responses. Call services and translate results/errors into HTTP responses.
- **Services:** Contain business logic and coordinate database operations. Never depend on Express Request or Response.
- **Schemas:** Define request validation using Zod.
- **Models:** Define database schemas and persistence.
- **Middleware:** Handle reusable concerns such as authentication and request validation.

## Agent skills

### Issue tracker

Issues and specs are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage roles mapped to standard label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`GLOSSARY.md` + `docs/adr/` at root). See `docs/agents/domain.md`.

## Git Branching, Commit & Merge Conventions

### Branching Policy
- **Main branch (`main`)**: Production-ready code only. Never commit untested work directly to `main`.
- **Feature branches**: Every ticket must be developed in its own branch branched from `main`:
  - Format: `feature/CS-NNN-<slug>` (e.g. `feature/CS-001-workspace-foundation`).
  - Bugfix format: `fix/CS-NNN-<slug>`.

### When to Commit
Commit only after a complete, verified TDD cycle and passing quality gates:
1. Meaningful test written first and failed (RED).
2. Minimal implementation code written and test passes (GREEN).
3. Code refactored cleanly (REFACTOR).
4. `pnpm type-check` passes with zero errors across all packages.
5. `pnpm test` passes with zero failures.
6. Commit message follows conventional commits: `feat(CS-NNN): <description>` or `fix(CS-NNN): <description>`.

### When to Merge to `main`
- Merge to `main` only when all acceptance criteria for the ticket are satisfied and verified by code review.
- Always ask the user for confirmation before committing, merging, or pushing.
- After merging to `main`, delete the feature branch.

## Database & TDD Guidelines
- **Prisma Data Layer**: Database schemas are maintained centrally in `apps/api/prisma/schema.prisma` (not in scattered model files). Feature folders contain `routes`, `controller`, `service`, `schema`, and `test`.
- **Strict Incremental TDD**: RED → GREEN → REFACTOR is mandatory for every observable behavior.

