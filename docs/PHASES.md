# Nenap — Phases & Milestone Checklists

> Each phase ends with a review: **Completed · Decisions · Open questions · Risks · Next phase.**
> No phase auto-advances without founder approval. Visual/AI work ships in small reviewable slices;
> plumbing ships as whole-phase drops.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

---

## Phase 1 — Foundation *(plumbing)* — ✅ scaffolded (DB/Supabase pending)
**Goal:** a runnable, on-brand, authenticated skeleton end-to-end.

- [x] Monorepo: pnpm workspaces + Turborepo, `Makefile`, `.gitignore`/`.gitattributes`, `README`, git init
- [x] `packages/types`: Zod schemas + inferred types (Note, Folder, Tag, statuses, DTOs) + tests
- [x] Backend (NestJS + Prisma): config module (env validation), **full schema**, Supabase JWT guard, `/health` + `/me`, Swagger/OpenAPI
- [~] **First migration** — schema written; `prisma migrate` deferred until a database exists (run `make db-migrate`)
- [x] Frontend (Next.js 15): App Router shell, Tailwind v4 + Hi-Fi tokens, fonts (Newsreader/Hanken/Spline Mono), themed primitives, brand mark
- [x] **Auth screen built to Hi-Fi**: email/password active, Google dormant; lands on dashboard
- [x] Authed shell calls backend `/health` + `/me` (ConnectionStatus proves the JWT handshake)
- [x] `docker-compose.yml`: local Postgres; Supabase env documented in `.env.example`
- [x] GitHub Actions: install + prisma generate + typecheck + lint + test + build on PR

**Milestone:** ✅ `pnpm dev` runs both apps; on-brand auth + dashboard shell render; backend health is wired.
**Verified:** typecheck ✓ · 7 unit tests ✓ · lint ✓ · build ✓ (all green locally).
**Remaining before "done":** provision Supabase + DB, run the first migration, verify a real email/password login end-to-end.

## Phase 2 — Notes, Folders, Tags, Dashboard *(hybrid)* — ✅ scaffolded (DB pending)
**Goal:** the core notebook works.

- [x] Notes CRUD API (service layer, ownership enforced) + unit tests (6)
- [x] Folders API (create/rename/delete; notes detach on folder delete)
- [x] Tags API (list; connectOrCreate on note save — capture-first)
- [x] Shared Zod contract enforced via `ZodValidationPipe`; `UsersService.ensureUser` lazy profile sync
- [x] Component primitives from Hi-Fi: button, input, search-field, chip, tag, segmented, note-card, avatar, modal+sheet, toast, skeleton, empty-state
- [x] Responsive shell: desktop sidebar (live folders + counts) + mobile header/FAB
- [x] Dashboard: note-card grid, folder + "with recording" + tag filters, debounced search
- [x] Tiptap editor with `.prose` styling; save modal (folder picker + tag input)
- [x] Empty states (encouraging microcopy) + skeleton loaders + query invalidation

**Milestone:** ✅ Notes/Folders/Tags CRUD wired end-to-end; dashboard + editor built to Hi-Fi.
**Verified:** typecheck ✓ · lint ✓ · 13 unit tests ✓ · build ✓ (routes /, /login, /notes/new, /notes/[id]).
**Remaining before "done":** run against a live DB (migration) + verify CRUD in the browser once Supabase is connected. Note View tabs (Enhanced/Original/Transcript) and recording arrive in Phases 3–4.

## Phase 3 — Recording & Storage *(hybrid)* — ✅ done & verified live
**Goal:** capture audio calmly.

- [x] In-browser WebM/Opus recording (`useRecorder`); waveform + timer; clay language
- [x] Live transcript feed (Web Speech API, `useSpeechTranscript`)
- [x] Signed-URL direct upload to Supabase Storage (private `recordings` bucket; backend issues URL)
- [~] Upload-existing-recording path — **deferred** (founder choice)
- [~] Inline transcript comments → note content — **deferred** to Phase 4/5
- [x] Recording metadata persisted (duration, size, mime); note → processing; transcribe job queued
- [x] Note-first recording rail (editor) + record-first screen (`/record`) + dashboard/mobile Record buttons
- [x] Deleting a note also removes its stored audio (storage isn't cascade-linked)

**Milestone:** ✅ verified end-to-end live — record → signed upload → file in bucket → recording row → note `processing` → `transcribe/queued` job. 17 backend tests; typecheck/lint/build green.
**Note:** playback (signed download URL in Note View) not yet wired — small follow-up; Phase 4 fills the transcript/enhanced tabs.

## Phase 4 — Gemini Processing *(hybrid)*
**Goal:** the gentle AI moment.

- [ ] Gemini orchestration service (transcript + enhancement), backend-only
- [ ] ProcessingJob lifecycle: auto-retry (max 3, backoff) + periodic stuck-job sweep + manual retry
- [ ] Note view tabs: Enhanced / Original / Transcript
- [ ] "Improving your note" orb moment + staggered blur-up reveal on the frontend
- [ ] Status surfacing (processing/failed/completed) with calm feedback

**Milestone:** save a recorded note → watch it become an enhanced note; original preserved.

## Phase 5 — Autosave, Improve Again, Search *(hybrid)*
- [ ] Debounced server autosave + localStorage draft + restoration prompt
- [ ] Improve Again → new EnhancedNoteVersion
- [ ] Postgres full-text search (tsvector on title/content) + tags/folder/date filters wired to dashboard

**Milestone:** edits never lost; regeneration works; search finds notes across titles/tags/transcripts.

## Phase 6 — Testing, Monitoring, Analytics
- [ ] Playwright E2E for core flows (auth, note CRUD, record→enhance, search)
- [ ] Sentry (frontend + backend) error monitoring
- [ ] PostHog analytics (privacy-conscious events)
- [ ] Test coverage review on critical paths

**Milestone:** green E2E suite; errors observable in production.

## Phase 7 — Deployment & Production readiness
- [ ] Vercel deploy (frontend) + Railway deploy (backend) pipelines
- [ ] Supabase production project; env/secret management
- [ ] Production readiness review (security, rate limits, backups, cost caps)
- [ ] Final docs: README, setup guide, runbook

**Milestone:** Nenap is live and operable.
