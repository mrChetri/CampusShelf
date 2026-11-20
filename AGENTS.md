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

## Git & GitHub Pull Request Workflow Conventions

### 1. Branching Policy
- **Main branch (`main`)**: Production-ready code only. Never implement or commit feature changes directly on `main`.
- **Feature branches**: Every implementation ticket must be developed in its own dedicated branch branched from the latest `main`:
  - Format: `feature/CS-NNN-<slug>` (e.g. `feature/CS-004-donate-book`).
  - Bugfix format: `fix/CS-NNN-<slug>`.

### 2. After Implementation Quality & Review Gates
Once a ticket is implemented:
- Run configured quality gates: `pnpm type-check`, `pnpm test`, linting, and production builds where applicable.
- Perform a code review against the PRD, ticket, master specification (`spec.md`), and project conventions.
- Fix legitimate findings and rerun affected checks until all pass green.
- Inspect staged and untracked files (`git status`).
- Never commit secrets, `.env` files, or unrelated user modifications.

### 3. Commit & Push Conventions
- Commit verified changes using Conventional Commits: `feat(CS-NNN): <description>` or `fix(CS-NNN): <description>`.
- Push the feature branch to GitHub: `git push -u origin feature/CS-NNN-<slug>`.
- Never push directly to `main`.
- Never force-push (`--force`) without explicit human authorization.

### 4. GitHub Pull Request Creation
- Use the configured GitHub MCP integration for all GitHub operations.
- Create a Pull Request from the current feature branch into `main`.
- Write a clear, ticket-based title and description (e.g. `feat(CS-004): book donation listing creation flow`).
- Summarize implemented functionality and significant architectural decisions.
- Include verification/testing results and note any remaining considerations.
- Link the associated ticket from `.scratch/campusshelf/issues/` and master specification (`spec.md`).
- Output the generated PR URL directly to the user.

### 5. Mandatory Human Approval (Strict Policy)
- **Never merge a Pull Request autonomously.**
- **Never approve your own Pull Request.**
- **Never delete the feature branch before human approval and merge.**
- After creating the PR, stop calling tools and wait for human review.
- Explicitly notify the user that the PR is ready for human review.
- Ask the user to inform you after they have manually merged it or if they encounter any issues.

### 6. Post-Merge Synchronization
- Do not assume a PR has been merged. Only proceed when the user explicitly confirms that the PR has been merged and asks to assist.
- **Workflow on confirmation**:
  1. Verify the PR's actual merged state via GitHub MCP or `gh`.
  2. Inspect local Git status to preserve any uncommitted user work.
  3. Fetch and safely synchronize local `main`: `git checkout main && git pull origin main`.
  4. Verify that local `main` contains the merged changes.
  5. Delete only the completed local feature branch using safe deletion (`git branch -d feature/CS-NNN-<slug>`).
  6. Never force-delete (`-D`) branches or discard uncommitted changes.

### 7. Git & Environment Safety
- On Windows, execute Git state-changing commands (`git add`, `git commit`, `git checkout`, `git switch`, `git branch`, `git clean`, `git push`) with `BypassSandbox: true` directly to avoid AppContainer loose-object write permission blocks.
- **Git Credential & Push Configuration**: The default GitHub account is configured as `mrChetri` (`credential.https://github.com.username mrChetri` and `origin` remote URL bound to `mrChetri`), allowing direct non-blocking `git push` operations.
- Never modify `.git` internal files or directory structures manually.
- Never alter Windows folder permissions (`icacls`, `attrib`) to bypass Git errors without explicit approval.
- Never reset (`git reset --hard`), clean (`git clean -fdx`), force-push, or discard user changes without permission.
- Verify the result of every Git and GitHub operation before reporting success.
- Stop and report blockers immediately rather than repeatedly attempting dangerous workarounds.

## Database & TDD Guidelines
- **Prisma Data Layer**: Database schemas are maintained centrally in `apps/api/prisma/schema.prisma` (not in scattered model files). Feature folders contain `routes`, `controller`, `service`, `schema`, and `test`.
- **Strict Incremental TDD**: RED → GREEN → REFACTOR is mandatory for every observable behavior.

