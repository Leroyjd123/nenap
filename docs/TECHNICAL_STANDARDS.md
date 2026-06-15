# Nenap — Technical Standards

> How we write code, fix bugs, add features, and test. Binding for all contributors (human or agent).
> Guiding value: **Simple → Understandable → Maintainable.** Clarity over cleverness. Optimize for shipping.

## 1. Architecture rules (hard constraints)

1. **Separation:** Frontend never talks to Gemini or the database directly. `Frontend → NestJS → Supabase/Gemini`.
2. **The backend is the only trusted boundary.** It owns auth verification, validation, authorization, AI orchestration, and storage signing.
3. **Layered backend:** `Controller → Service → Repository`. Controllers do HTTP only; services hold business logic; repositories (Prisma) do data access. No Prisma calls in controllers.
4. **Shared contract:** request/response shapes live as **Zod schemas in `packages/types`**. Backend validates with them; frontend infers types from them. One definition, no drift. OpenAPI is auto-emitted from Nest for docs.
5. **Ownership enforced in the service layer** (no RLS for MVP). Every data query is scoped to the authenticated `userId`.

## 2. Languages, tooling, conventions

- **TypeScript everywhere**, `strict: true`. No `any` without a written justification comment.
- **Formatting:** Prettier (default). **Linting:** ESLint. Both run in CI and block merge.
- **Naming:** `camelCase` vars/functions, `PascalCase` types/classes/components, `kebab-case` file names (frontend components may use `PascalCase.tsx`). Booleans read as predicates (`isLoading`, `hasRecording`).
- **No dead code, no commented-out blocks** committed. Delete it; git remembers.
- **Comments explain *why*, not *what*.** Match the surrounding density.
- **Imports:** absolute via workspace aliases (`@nenap/types`), no deep relative `../../../`.

## 3. Git & review workflow

- **Branch** off `main` per unit of work: `feat/…`, `fix/…`, `chore/…`, `docs/…`.
- **Small PRs.** One concern per PR. Description states what/why + how to verify.
- **CI gates:** typecheck + lint + tests must pass before merge. `main` is always green.
- **Conventional commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- Never bypass hooks or skip signing unless explicitly requested.

## 4. Testing & TDD

**Cadence (approved):** backend unit + integration tests written *with* each feature; Playwright E2E added in Phase 6 once flows stabilise.

- **TDD for backend business logic:** write a failing test → minimal code to pass → refactor. Applies especially to services (note processing, ownership, job lifecycle, search).
- **Test pyramid:** many fast unit tests (services, pure functions, Zod schemas) → fewer integration tests (controller↔db with a test Postgres) → few E2E (critical user journeys).
- **What must have tests:**
  - Every service method with branching logic.
  - ProcessingJob state machine (retry, stuck-sweep, failure paths).
  - Authorization: a user can never read/mutate another user's data.
  - Zod schema edge cases (invalid input rejected).
- **Frontend:** component tests for stateful/interactive pieces; visual primitives verified against Hi-Fi by eye in slices.
- **No feature is "done" until its tests are green and the change is verified running**, not just compiled.
- Tools: **Vitest/Jest** (unit/integration), **Supertest** (Nest HTTP), **Playwright** (E2E).

## 5. How to implement a new feature

1. **Restate the objective** and check it against PRD + USER_FLOWS. Flag scope creep.
2. **Identify decisions needing founder input** (product/design/architecture/security/cost) → consult before building.
3. **Contract first:** add/extend Zod schemas in `packages/types`.
4. **Backend:** repository → service (TDD) → controller → migration if schema changes (Prisma migrate, never edit applied migrations).
5. **Frontend:** build to Hi-Fi; wire TanStack Query to the typed client; optimistic updates + loading/empty/error states.
6. **Tests + verify running.** Update docs (USER_FLOWS / PHASES checkboxes / CONTEXT log).
7. **Self-review** the diff critically before opening the PR.

## 6. How to fix a bug

1. **Reproduce** reliably; capture the exact steps + observed vs expected.
2. **Write a failing test** that encodes the bug. (Regression guard.)
3. **Find root cause**, not symptom. Read the surrounding code; understand *why* it happened.
4. **Fix minimally**; make the test pass.
5. **Check for siblings** — the same mistake elsewhere.
6. **Verify running**, update CONTEXT log if the bug revealed a wrong assumption.
- Report bugs faithfully: if tests fail or a step was skipped, say so with the output.

## 7. Error handling & reliability

- **Fail loud, never silent.** Surface errors to the user calmly; log details server-side.
- **Validate at the boundary** (Zod) — trust nothing from the client.
- **Idempotent, recoverable jobs:** processing state lives in Postgres; transient failures auto-retry with backoff; crashed jobs are re-queued by the stuck-job sweep; users get a manual retry.
- **No secrets in the frontend.** All keys (Supabase service role, Gemini) live server-side only.
- **Cost guardrails:** enforce recording length + monthly processing caps in the service layer.

## 8. Performance & UX standards

- Loading states, skeleton loaders, optimistic updates, autosave, empty states are **required**, not optional.
- Mobile-first; responsive desktop; accessible (semantic HTML, focus states, contrast per design).
- Animations subtle: 120–300 ms, `cubic-bezier(.2,.7,.3,1)`; fade/slide/lift; no bounce.

## 9. Dependencies

- Prefer the standard library and what's already in the repo. Add a dependency only when it earns its weight.
- No technology adopted because it is fashionable. Challenge complexity; recommend the simpler path.

## 10. Definition of Done

- [ ] Matches PRD/flows; design matches Hi-Fi.
- [ ] Contract typed in `packages/types`; validated at the boundary.
- [ ] Tests written and green; change verified running.
- [ ] Loading/empty/error states handled.
- [ ] Lint + typecheck pass; PR small and self-reviewed.
- [ ] Docs/checklists updated (PHASES, CONTEXT).
