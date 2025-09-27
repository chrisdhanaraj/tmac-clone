# Implementation Plan: Magic Link Login Flow

**Branch**: `001-i-want-to` | **Date**: 2025-09-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-i-want-to/spec.md`

## Execution Flow (/plan command scope)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Implement passwordless authentication using magic links for the tennis club application. Users enter their email address, receive a secure time-limited link via email, and are automatically authenticated when they click the link. The system leverages BetterAuth Magic Link plugin with auto-signup disabled for security, requiring users to be pre-registered. Magic links have 5-minute expiration. Upon successful authentication, users are redirected to their dashboard with proper session management.

## Technical Context

**Language/Version**: TypeScript 5.8+ with strict mode enabled  
**Package Manager**: pnpm (workspace configuration) - all commands use pnpm, not npm
**Primary Dependencies**: React Router 7+, BetterAuth 1.2+, Prisma 6.8+, Zod 3.25+  
**Storage**: PostgreSQL with Prisma ORM, existing User and Session entities  
**Testing**: Vitest for unit/integration tests, Playwright for E2E testing  
**Target Platform**: Web application (SSR/SPA hybrid with React Router)
**Project Type**: Web application (frontend + backend in single React Router app)  
**Performance Goals**: <200ms auth response time, immediate UI feedback  
**Constraints**: Must use BetterAuth Magic Link plugin with auto-signup disabled, leverage existing auth infrastructure  
**Scale/Scope**: Tennis club membership system, ~500-1000 users, email-based authentication only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Database-First Architecture**: Database schema must be defined in Prisma before any implementation begins. All entities and relationships documented.

**Type Safety & Validation**: TypeScript strict mode required. All external inputs validated with Zod schemas.

**Test-Driven Development**: Contract tests, integration tests, and unit tests must be written and failing before implementation.

**Component Architecture**: React components must be isolated, reusable, with clear prop interfaces.

**User Experience**: All interfaces must prioritize member experience with proper accessibility and responsive design.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
apps/front-office/
├── app/
│   ├── components/ui/           # shadcn/ui components (Button, Card, Input, Label)
│   ├── features/
│   │   ├── auth/
│   │   │   ├── api/            # auth-client.ts, auth.server.ts
│   │   │   ├── routes/         # login.tsx (magic link form)
│   │   │   ├── email/          # loopsClient.server.ts
│   │   │   └── __tests__/      # Auth feature tests (colocated)
│   │   │       ├── magic-link.test.ts      # Magic link flow integration tests
│   │   │       ├── login-form.test.tsx     # Login form component tests
│   │   │       └── auth-api.test.ts        # Auth API contract tests
│   │   └── user/
│   │       ├── user.tsx        # User dashboard (redirect target)
│   │       └── __tests__/      # User feature tests
│   │           └── user-dashboard.test.tsx
│   ├── config/                 # env.ts, prisma.ts
│   ├── lib/                    # utils.ts
│   └── routes.ts               # Route configuration
├── prisma/
│   ├── schema.prisma           # User, Session entities
│   └── migrations/             # Database migrations
└── tests/
    └── e2e/                    # Playwright end-to-end tests only
        └── magic-link-flow.spec.ts
```

**Structure Decision**: React Router 7 full-stack application with feature-based organization. Authentication logic lives in `app/features/auth/`, leveraging existing BetterAuth setup. Tests are colocated within each feature's `__tests__/` directory for better organization and discoverability. Only E2E tests remain in the global `tests/` directory.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:

   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: ✅ research.md complete - All technical decisions documented with rationale

## Phase 1: Design & Contracts

_Prerequisites: research.md complete_

1. **Extract entities from feature spec** → `data-model.md`:

   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:

   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:

   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:

   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh cursor`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: ✅ Phase 1 Complete

- data-model.md: Entity analysis and validation schemas
- contracts/magic-link-api.yaml: OpenAPI specification for auth endpoints
- quickstart.md: Manual testing scenarios and validation steps
- .cursor/rules/specify-rules.mdc: Updated agent context

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task in `app/features/auth/__tests__/` [P]
- Each user story → integration test task colocated with feature [P]
- UI component tests → colocated in respective feature `__tests__/` directories [P]
- E2E tests → global `tests/e2e/` directory
- Implementation tasks to make tests pass

**Ordering Strategy**:

- TDD order: Tests before implementation within each feature
- Feature isolation: Auth tests in auth feature, user tests in user feature
- Dependency order: Contract tests → Integration tests → Component tests → Implementation
- Mark [P] for parallel execution (independent features and test files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Database-First Architecture: No schema changes needed, leverages existing User/Session entities
- [x] Type Safety: TypeScript strict mode enabled, Zod validation schemas defined
- [x] Test-Driven Development: Contract tests, integration tests, and unit test approach documented
- [x] Component Isolation: React Router 7 feature-based organization, existing shadcn/ui components reused
- [x] User Experience: Accessible shadcn/ui components (built on Radix UI), responsive design, clear error feedback
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented: None - leverages existing infrastructure

---

_Based on Constitution v1.0.0 - See `.specify/memory/constitution.md`_
