# Nenap — Context & Decision Log

> The single reference for *what we decided, why, what's done, and what's pending.*
> Read this first when picking the project back up. Append new entries; don't rewrite history.

## Roles
- **Founder / product owner:** Leroy (leroy.social@gmail.com) — owns strategy & direction.
- **Execution (CTO/Principal Eng/Staff Design/Tech Lead):** Claude Code agent (model: Opus 4.8).
- **Protocol:** consult-first. Major product/design/architecture/security/business decisions need explicit founder approval. No phase auto-advances.

## Where things live
- `PLAN.md` — one-page roadmap & stack table (living).
- `docs/` — PRD, USER_FLOWS, PHASES, TECHNICAL_STANDARDS, CONTEXT (this), DESIGN_STANDARDS.
- `design/` — **Nenap Hi-Fi** prototype (binding visual spec) + `README.md` + `nenap/*.jsx`.
- `design-system/nenap-tokens.css` — canonical design tokens (Tailwind v4 `@theme`), extracted from Hi-Fi.
- `design/assets/logo-master.png` — brand mark master (firefly, 1536×1024, 2 MB — needs web-optimized export + favicon when branding is wired).
- The earlier `DESIGN.md` spec was provided in chat only (never a repo file); **superseded** by the Hi-Fi design.

## Approved decisions (chronological)

### Architecture & stack
- **Monorepo**, pnpm workspaces + Turborepo, shared `@nenap/types`.
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind v4, shadcn/ui, TanStack Query, Zustand, Tiptap.
- **Backend:** NestJS + Prisma. *(Diverges from the original master doc's FastAPI/Python — founder chose all-TypeScript for end-to-end type safety.)*
- **Supabase** kept: Auth, Storage, Postgres hosting. NestJS statelessly verifies Supabase JWTs.
- **DB access:** backend-only gateway; no RLS for MVP; ownership in the service layer.
- **AI:** Gemini 2.x **Flash** for transcript + enhancement. Backend owns all Gemini calls.
- **Jobs:** in-process async + Postgres `ProcessingJob` state; auto-retry + stuck-job sweep + manual retry. No Redis/Celery for MVP.
- **Schema:** full data model in one upfront Prisma migration.

### Product & UX
- **Capture is dual:** note-first (record within a note) AND record-first (from dashboard).
- **Enhancement:** auto-runs on save when a recording exists; "Improve Again" = manual regen → new version. **Original never overwritten.** Non-destructive Enhanced/Original/Transcript tabs.
- **Editor:** Tiptap markdown rich text, minimal chrome.
- **New entities** beyond master doc: **Folder** (one per note) + **Tag** (many-to-many).
- **Live transcript:** Web Speech API (live feel) + Gemini (canonical transcript on save). No paid STT for MVP.
- **Autosave:** debounced server autosave + localStorage draft backup; not full offline-first.
- **Dashboard:** reverse-chron note-card feed + filters (folder/tags/date/has-recording).
- **AI is invisible:** one gentle "Improving your note" orb; no chatbot/persona.

### Auth
- **Email/password is active for MVP.** Google sign-in UI is wired but **dormant** (placeholder creds) until Google OAuth is configured later.

### Process & quality
- **Phasing:** hybrid — small reviewable slices for visual/AI, whole-phase drops for plumbing.
- **Testing:** backend unit+integration as-we-go; Playwright E2E in Phase 6.
- **Contract:** shared Zod in `packages/types` = single source of truth; OpenAPI auto-emitted.
- **CI:** GitHub Actions from Phase 1 (lint/typecheck/test); deploys in Phase 7. Single prod env.
- **Credentials path (Option B):** founder will provide **Supabase** credentials; Google stays placeholder.

### Design
- **`design/Nenap Hi-Fi.*` is the binding visual spec**, superseding DESIGN.md on conflict.
- Fonts: **Newsreader + Hanken Grotesk + Spline Sans Mono** (replaced Literata/Inter).
- Palette: bg `#faf8f2`, surface `#fffdf8`, ink `#2a2823`, accent/sage `#6f7d57`, clay `#b3705a`.
- Rule: **sage = action/selection; clay = recording only.** Radius 14px; warm low-contrast shadows; density modes.

## What we've done so far
- Ran the full consultation: locked architecture, stack, product flows, process, and deep-tech decisions.
- Founder provided **DESIGN.md** then the richer **Nenap Hi-Fi** design (now canonical) + logo.
- Reconciled the design vs the plan; flagged & resolved font/palette/radius conflicts in the design's favour.
- Extracted canonical tokens → `design-system/nenap-tokens.css`.
- Updated `PLAN.md` to make Hi-Fi the source of truth; updated Phase 1/2 to build to it.
- Authored this docs suite: PRD, USER_FLOWS, PHASES, TECHNICAL_STANDARDS, CONTEXT, DESIGN_STANDARDS.

## Phase 1 — DONE (scaffolded & verified locally) ✅
Built against **placeholder env**; all green locally: typecheck ✓ · 7 unit tests ✓ · lint ✓ · build ✓. Git initialised (not committed yet).
- Monorepo (pnpm + Turborepo), `packages/types` (Zod + tests), NestJS backend (env validation, full Prisma schema, Supabase JWT guard, `/health` + `/me`, Swagger), Next.js 15 frontend (Hi-Fi tokens + fonts, themed Button/Input, Brand, Auth screen email/pw + dormant Google, dashboard shell + ConnectionStatus handshake), docker-compose (Postgres), GitHub Actions CI.
- Decisions made while building: jose for JWT verify; global APP_GUARD + `@Public()`; `User.id` = Supabase auth uid; pnpm `onlyBuiltDependencies` allowlist; `.gitattributes` LF normalization; frontend test `--passWithNoTests`.

## Phase 2 — DONE (scaffolded & verified locally) ✅
Branch `feat/phase-2-notes`. All green locally: typecheck ✓ · lint ✓ · 13 tests ✓ · build ✓.
- Backend: Notes/Folders/Tags modules (service + controller), ownership enforced in service layer, `ZodValidationPipe` (shared contract), `UsersService.ensureUser` lazy profile sync, `toExcerpt` strips HTML+markdown.
- Frontend: TanStack Query hooks (`lib/queries.ts`), Hi-Fi primitives (Button/Input/Chip/Tag/Segmented/Modal/Toast/Skeleton/EmptyState/NoteCard), responsive AppShell (live folders), Dashboard (filters + debounced search), Tiptap NoteEditor + SaveNoteModal, routes `/notes/new` + `/notes/[id]`.
- Repo cleanup done: removed duplicate `logo.svg`, moved master to `design/assets/logo-master.png`, added `.gitattributes` + `.markdownlint.json`. Phase 1 committed on `master` (1470900).
- **Remaining:** live-DB verification once Supabase connected. Note View tabs + recording = Phases 3–4.

## Supabase — partially wired (2026-06-15)
- Project: `iohmtxsvrymrazyyakdo`. **URL + publishable key** provided and wired:
  `frontend/.env.local` (auth-only browser client) and `backend/.env` (`SUPABASE_URL`).
- Backend guard verifies tokens via the **JWKS endpoint** (asymmetric) with HS256 fallback — no JWT secret needed for `/me`.
- New-key format → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (env.ts also accepts legacy anon).

## Live DB — migration APPLIED & data model VERIFIED (2026-06-15, via Supabase MCP)
- `init_nenap_schema` applied to project `iohmtxsvrymrazyyakdo` (region ap-northeast-1). All 9 tables present, 0 rows.
- Data-model round-trip exercised via MCP execute_sql (now cleaned up, DB pristine): create user→folder→tag→note + dashboard join ✓; folder delete → note.folderId NULL (SetNull) ✓; note/user delete cascades ✓.
- Security advisors: 9× `rls_enabled_no_policy` (INFO) — **intentional/safe**: RLS on + no policy locks the public PostgREST API; our backend uses the `postgres` role (bypasses RLS); frontend never queries DB directly. Two WARNs about pre-existing `public.rls_auto_enable()` (project artifact, not ours) — optionally `REVOKE EXECUTE ... FROM anon, authenticated`.
- **Backend ↔ live DB VERIFIED (2026-06-15):** real DB password in `backend/.env` (gitignored). Prisma migration baselined via `migrate resolve --applied` → `migrate status` = "up to date". Runtime pooled connection (6543/pgbouncer) round-trip passed through the actual Prisma client: user→folder→note + connectOrCreate tag + list-with-tags + cascade delete on user removal. DB pristine.
- **Only remaining manual step:** a human browser click-through (signup → note → dashboard) — every underlying layer is proven, so it's a formality. Frontend dev server + a real Supabase email signup needed (can't be done headlessly here).
- Phase 2 merged to `master` (01c174c); feature branch deleted.

## Dev/test notes (2026-06-15 bug-fix pass 2)
- **Note-save 500 fixed:** `UsersService.ensureUser` now self-heals stale email-mirror rows (P2002) — happened because the demo auth user was recreated with a new id while `public.users` kept the old id under the same email. Verified live (demo login → create note → persists).
- **Testing path = the dev demo-login button** (founder's choice). Real email/password auth is **deferred**: email confirmation stays ON in Supabase but unconfirmed accounts can't log in, so use the demo button. Before prod: either disable "Confirm email" or set Site URL + `/auth/callback` redirect.
- Added: empty-note save guard (#1), auth-redirect error surfacing on `/` (#5), resend-email on verify screen (#4).

## Dev/test notes (2026-06-15 bug-fix pass)
- **Demo account (DEV-ONLY, remove before prod):** `ljdstore@yopmail.com` / `NenapDemo123!`, created confirmed via MCP SQL (auth.users + auth.identities). One-click button on the login page. Verified via the GoTrue token endpoint.
- **Email confirmation requires a Supabase setting:** Authentication → URL Configuration → set Site URL `http://localhost:3000` and add redirect `http://localhost:3000/auth/callback` (and the prod equivalents). Otherwise the confirm link won't return to `/auth/callback`.
- Routing now: `/notes/[id]` = read-only Note View (Enhanced/Original/Transcript tabs), `/notes/[id]/edit` = editor, `/notes/new` = create. Delete uses on-brand ConfirmModal. Folder creation in sidebar.
- Open: #3 console errors (need user paste), #5 design fidelity pass (need screenshots/specifics).

## Still needed from founder (later)
- **Supabase secret key** (`sb_secret_…`) — for Storage signing in Phase 3.
- (Optional) DB password / `DATABASE_URL` only if we ever run Prisma migrate directly instead of via the MCP.

## Pending tasks / next up
- **Then Phase 2** (Notes/Folders/Tags/Dashboard) — awaiting founder go.
- Docker is NOT installed on the dev machine — needed for `make db-up`, or use Supabase directly.

## Risks & watch-items
- `logo.svg` is 2 MB (likely embedded raster) — verify crispness; may need a lighter mark.
- Web Speech API is Chrome/Edge-strong, weaker on Safari/Firefox (Gemini guarantees the stored transcript).
- Supabase free-tier limits (fine for MVP); Railway cold starts (acceptable now).
- Gemini cost — mitigated by Flash + recording length + monthly caps.

## Decision rule for the future
When a request conflicts with an approved decision here, **stop and confirm** rather than silently override. Update this log whenever a decision is made or changed.
