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

## Phase 2 — Notes, Folders, Tags, Dashboard *(hybrid)*
**Goal:** the core notebook works.

- [ ] Notes CRUD API (service + repository layers) + unit/integration tests
- [ ] Folders API (create/rename/delete/move) + tests
- [ ] Tags API (create/attach/detach) + tests
- [ ] Component primitives from Hi-Fi: buttons, input/search-field, chip, tag, segmented, note-card, avatar, eyebrow/meta, modal+sheet, toast
- [ ] Desktop `.d-shell` + mobile `.m-tabbar`/`.m-fab` shells
- [ ] Dashboard: note-card grid, folder + "with recording" filters, recent notes
- [ ] Tiptap editor with prose styling; save modal (folder + tags)
- [ ] Empty states (encouraging microcopy) + skeleton loaders + optimistic updates

**Milestone:** create, edit, organise, and delete real notes with folders and tags.

## Phase 3 — Recording & Storage *(hybrid)*
**Goal:** capture audio calmly.

- [ ] In-browser WebM/Opus recording; waveform + timer; clay recording language
- [ ] Live transcript feed (Web Speech API)
- [ ] Signed-URL direct upload to Supabase Storage (backend issues URL)
- [ ] Upload-existing-recording path
- [ ] Inline transcript comments → note content
- [ ] Recording metadata persisted (duration, file ref, mime)

**Milestone:** record from a note and from the dashboard; audio lands in storage.

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
