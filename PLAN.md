# Nenap — Build Plan & Roadmap

> Living source of truth. Updated at each phase boundary.
> Tagline: *"Focus on the moment. Nenap remembers the rest."*
> Philosophy: Notes are primary · Recording is supportive · Transcript is reference · **AI is invisible**.

---

## Architecture (approved)

```
Next.js 15 (Vercel)  →  NestJS (Railway)  →  Supabase (Postgres · Auth · Storage)  →  Gemini Flash
   frontend                gateway/orchestration       data · identity · files            AI
```

Frontend never talks to Gemini or the DB directly. Backend owns AI, validation, auth, orchestration.

## Design — source of truth

**`design/Nenap Hi-Fi.html` (+ `.standalone.html`, `nenap/*.jsx`, `design/README.md`) is the binding visual spec.**
It supersedes the earlier `DESIGN.md` wherever they conflict. Canonical tokens are extracted to
`design-system/nenap-tokens.css` (Tailwind v4 `@theme`) and imported by the frontend.

- **Fonts:** Newsreader (display/prose), Hanken Grotesk (UI), Spline Sans Mono (meta/tags/transcript). *(supersedes Literata/Inter)*
- **Palette:** bg `#faf8f2`, surface `#fffdf8`, ink `#2a2823`, accent/sage `#6f7d57`, clay `#b3705a`.
- **Rule:** sage = action/selection; **clay = recording state only** (never a generic CTA).
- **Shape:** radius 14px cards, warm low-contrast shadows. Density modes compact/regular/roomy.
- **Signature moment:** the calm "Improving your note" orb (breathing rings + staggered blur-up reveal) — the *only* AI flourish. No persona, no chat.
- **Shells:** desktop `.d-shell` (220px sidebar + top bar, 2-col grid); mobile `.m-top` + `.m-tabbar` + `.m-fab`, modals as bottom sheets.
- **Screens:** Auth · Dashboard · Editor · Record · Note View (Enhanced/Original/Transcript + Improve again) · Folders & Tags · Search.
- **Principles:** notes-first; capture-first / organise-later; AI present but gentle; one folder per note, tags cross-cut; calm.

## Stack (approved)

| Area | Choice |
|------|--------|
| Monorepo | pnpm workspaces + Turborepo |
| Shared contract | `packages/types` — Zod = single source of truth (runtime + types), OpenAPI auto-emitted |
| Frontend | Next.js 15 (App Router), TS, Tailwind v4, shadcn/ui (themed to **Nenap Hi-Fi** tokens), TanStack Query, Zustand, Tiptap |
| Backend | NestJS + Prisma |
| Auth | Supabase — **Email/Password active now**; Google wired but dormant (placeholder creds). NestJS verifies JWTs statelessly |
| DB | Supabase Postgres, backend-only access, no RLS for MVP |
| Storage | Supabase Storage, direct signed-URL upload (WebM/Opus) |
| AI | Gemini 2.x Flash (transcript + enhancement); soft caps ~60 min/recording + monthly limit |
| Live transcript | Web Speech API (live) + Gemini (canonical on save) |
| Jobs | In-process async + Postgres job row; auto-retry (3, backoff) + stuck-job sweep + manual retry. No Redis |
| Search | Postgres full-text (tsvector) + tags/folder/date filters |
| Autosave | Debounced server autosave + localStorage draft backup |
| Testing | Backend unit+integration as-we-go; Playwright E2E in Phase 6 |
| CI | GitHub Actions from Phase 1; deploys Phase 7 |
| Deploy | Vercel · Railway · Supabase |

## Data model

```
User ─┬─< Folder ──< Note >── NoteTag >── Tag (per-user)
      └──────────────< Note
                        ├── Recording (0..1) ──< ProcessingJob
                        ├── Transcript (0..1)
                        ├── originalContent (never overwritten)
                        └──< EnhancedNoteVersion (1..n)
Note.status: draft | processing | completed | failed
```

---

## Phases

### Phase 1 — Foundation *(plumbing: whole-phase drop)*
- [ ] Monorepo: pnpm + Turborepo, Makefile, .gitignore, README, git init
- [ ] `packages/types`: Zod schemas + types (Note, Folder, Tag, statuses, DTOs)
- [ ] Backend NestJS + Prisma: config, **full schema + first migration**, Supabase JWT guard, `/health`, Swagger
- [ ] Frontend Next.js: App Router shell, Tailwind v4 importing `design-system/nenap-tokens.css`, fonts (Newsreader/Hanken Grotesk/Spline Sans Mono), shadcn init re-themed to Hi-Fi tokens, logo wired, Supabase client, **Auth screen built to Hi-Fi** (Google + email/pw, lands straight on dashboard), authed shell calling `/health`
- [ ] docker-compose: local Postgres + backend
- [ ] GitHub Actions: lint + typecheck + test on PR

### Phase 2 — Notes CRUD, Folders, Tags, Dashboard *(hybrid)*
- [ ] Notes CRUD API + service/repository layers + tests
- [ ] Folders + Tags API
- [ ] **Component primitives from Hi-Fi**: btn (primary/soft/ghost/rec), input/search-field, chip, tag, seg, note-card, avatar, eyebrow/meta, modal+sheet, toast
- [ ] Desktop `.d-shell` + mobile `.m-tabbar`/`.m-fab` shells
- [ ] Dashboard (Hi-Fi): note-card grid, search-field, folder + "with recording" filters, recent notes, Create/Record entry points
- [ ] Tiptap editor (prose styling), encouraging empty states, skeletons

### Phase 3 — Recording & Storage *(hybrid)*
- [ ] In-browser WebM/Opus recording, waveform + timer
- [ ] Web Speech live transcript feed
- [ ] Signed-URL direct upload to Supabase Storage
- [ ] Inline transcript comments → notes

### Phase 4 — Gemini Processing *(hybrid)*
- [ ] Gemini orchestration service (transcript + enhancement)
- [ ] ProcessingJob lifecycle + auto-retry + stuck-job sweep
- [ ] Note view tabs: Enhanced / Original / Transcript
- [ ] Status surfacing on frontend

### Phase 5 — Autosave, Improve Again, Search *(hybrid)*
- [ ] Debounced autosave + localStorage draft restoration
- [ ] Improve Again → new EnhancedNoteVersion
- [ ] Postgres full-text search + filters wired to dashboard

### Phase 6 — Testing, Monitoring, Analytics
- [ ] Playwright E2E for core flows
- [ ] Sentry (frontend + backend)
- [ ] PostHog analytics

### Phase 7 — Deployment & Production readiness
- [ ] Vercel + Railway deploy pipelines
- [ ] Supabase prod project, env management
- [ ] Production readiness review, docs

---

## Working protocol
Consult-first: options + tradeoffs + recommendation before major decisions; no auto-advancing phases. Each phase ends with: Completed / Decisions / Open questions / Risks / Next phase.
