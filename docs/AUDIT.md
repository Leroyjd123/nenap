# Nenap — Production-Readiness Audit

> Acting as CTO / Principal Architect / Staff Product, Security, UX & AI engineer.
> Reviewed: 2026-06-21, at commit `5a5ec9c`. Scope: the whole monorepo (frontend, backend,
> shared types, DB, infra, AI). This is a review, not a rewrite. Severity: **Critical / High /
> Medium / Low**. Effort: **S** (<½ day) · **M** (1–3 days) · **L** (1–2 weeks). Impact: 1–5.

---

## 1. Executive Summary

Nenap is, for its age, a genuinely well-structured app: a clean monorepo, a single shared Zod
contract, a backend-only data gateway, stateless JWKS auth, an in-process job queue with retries,
and an on-brand design system. Phases 1–4 plus notes/folders/tags, recording→transcribe→enhance,
attachments, and a monetization limits engine all work end-to-end against real Supabase + Gemini.

It is **not yet production-ready for thousands of users**, and that's expected — it was built
phase-by-phase as an MVP. The gaps cluster in five areas:

1. **Security** — unsanitized `dangerouslySetInnerHTML` (stored XSS), no rate limiting, a dev
   login with hard-coded credentials shipped in the client bundle.
2. **Scale correctness** — the job queue is not safe to run on more than one instance; search is
   unindexed `ILIKE`; no caching.
3. **Observability** — zero error monitoring, analytics, LLM tracing, or evals. You cannot see
   "who is doing what," what's failing, or what the AI costs.
4. **Polish** — partial mobile responsiveness, no motion/transitions, a thin homepage, no account
   page, no user-facing metrics.
5. **Confidence** — no frontend tests, no E2E, prompts hard-coded and unversioned.

None of this requires a rewrite. It requires a disciplined hardening pass. The architecture is
sound enough to carry it.

## 2. Overall Score: **6.5 / 10**

Strong MVP foundation (8/10 architecture), held back by security gaps, single-instance assumptions,
and a near-total absence of observability and tests (3/10 production-hardening). The score rises
quickly with the Critical/High roadmap below.

| Dimension | Score |
|---|---|
| Architecture & code structure | 8 |
| Product / UX | 6.5 |
| Design fidelity | 7 |
| Security | 4 |
| Database | 7 |
| AI design | 6 |
| Performance (perceived) | 5 |
| Scalability | 4.5 |
| Observability | 1.5 |
| Testing / DX | 5 |

---

## 3. Product Review

**Working well:** capture-first flows (note-first + record-first), the non-blocking "improving in
the background" model, Enhanced/Original/Transcript tabs with the original never overwritten,
encouraging empty states, opt-in AI-organise.

**Issues & gaps**
- **No account/profile page** *(High)* — nowhere to see your plan, usage, email, or sign out on
  desktop without the sidebar menu; no "delete my account" (a GDPR/expectation gap).
- **No user-facing metrics** *(High)* — you asked for "notes created, transcripts made"; there's
  no stats surface. Belongs on an account/home dashboard.
- **"Share" is phantom** *(Medium)* — analytics brief lists "Note Shared" but no sharing exists.
  Decide: build share (public link) or drop the event. Recommend dropping for now.
- **Multiple recordings per note is impossible by design** *(High)* — `Recording.noteId` is
  `@unique`, so a note has exactly one recording; re-recording *replaces* it. Your "add multiple
  voice recordings" bug is really a data-model limitation. Supporting many requires a schema change
  (drop the unique, add `Recording[]` to Note, update transcribe to handle N clips).
- **Information architecture** *(Medium)* — folders are single-select per note (good, calm), but
  there's no "recent", "all tags" browse, or trash/restore. Trash is the most-missed.
- **Onboarding** *(Low)* — first-run has no gentle guide; the empty state carries it for now.

## 4. UX Review

- **Loading/perceived speed** *(High)* — button spinners and nav feedback were added, but route
  transitions still feel heavy (Tiptap bundle, no prefetch warmth, polling). See Performance.
- **Mobile responsiveness** *(Critical for launch)* — the dashboard shell has a mobile layout, but
  the **note view, editor, record, plans, help, and legal pages use desktop-first inline widths**
  and a fixed `300px` recording rail in a `md:grid` that collapses awkwardly. Needs a deliberate
  responsive pass on every route.
- **Motion** *(High)* — essentially **zero transitions/animations**. For a "calm, premium" brand
  this is the single biggest felt-quality gap. Needs tasteful, reduced-motion-aware micro-interactions
  (page/section fades, card hover, modal/sheet spring, the enhancing reveal).
- **Error surfacing** *(Medium)* — improved (humanized auth errors, 402→/plans), but there's no
  global error boundary and no global 401→re-auth handling in `apiFetch`.
- **Empty/skeleton states** *(Low)* — good on the dashboard; missing on note view, plans, help.

## 5. Design Review

- **Brand fidelity** *(High)* — tokens, fonts (Newsreader/Hanken/Spline Mono), the firefly mark,
  and the Hi-Fi component classes are consistent and on-brand. The **homepage**, though, reads
  generic — it needs the editorial, Apple-Journal/Storyset-inspired warmth (illustration, real
  product imagery or tasteful SVG scenes, rhythm) to match the brand you built.
- **Accessibility** *(High)* — gaps: modals lack a focus trap; many icon-only/secondary controls
  lack `aria-label`; color-contrast of `--ink-3` on `--bg` is borderline; no skip-link; the
  segmented control and chips aren't keyboard-operable as a group. An a11y pass is needed before
  "thousands of users."
- **Consistency** *(Medium)* — the codebase is ~50/50 **inline styles vs. Tailwind utilities vs.
  `globals.css` component classes**. It works but fights maintainability. The stack claims
  *shadcn/ui* but none is actually used — either adopt it or drop the claim and standardize on the
  Hi-Fi classes.
- **Dark mode** *(Low)* — shipped and warm; a few hard-coded `#fff`/rgba spots want token-izing.

## 6. Frontend Architecture Review

- **State** *(Medium)* — TanStack Query is used well as the server-state layer. **Zustand is a
  declared dependency but unused** — remove it (or adopt it for the one piece of genuine client
  state, the recorder) rather than leave a dead dep.
- **API abstraction** *(Good)* — `lib/api.ts` + `lib/queries.ts` centralize fetching and keys.
  Add: a global **401 interceptor** (redirect to `/` / refresh) and typed error codes.
- **Component size** *(Medium)* — `note-view.tsx`, `note-editor.tsx`, `record-first.tsx` are large
  and mix layout + behavior. Extract presentational pieces; move the heavy inline styles into
  component classes.
- **Routing** *(Low)* — App Router is used cleanly; `AuthGuard` centralizes gating. Consider
  per-route `loading.tsx`/`error.tsx` for free Suspense + error boundaries.
- **No error boundary** *(High)* — a thrown render error blanks the app. Add a root error boundary
  (and Sentry once integrated).

## 7. Backend Review

- **Structure** *(Good)* — clean Nest modules, service-layer ownership checks, global guard +
  Zod pipe, shared contract. Dependency injection is idiomatic.
- **Duplicated ownership checks** *(Medium)* — `assertNoteOwned` is reimplemented in Notes,
  Recordings, Attachments, Processing. Extract a shared `OwnershipService` / guard.
- **No rate limiting** *(Critical)* — every endpoint, including the **expensive AI `improve` and
  recording `sign`**, is unthrottled. A single user (or abuser) can run up cost/load. Add
  `@nestjs/throttler` globally + tighter limits on AI/upload routes.
- **Logging** *(High)* — only Nest's default `Logger`. No structured/request-scoped logging, no
  correlation IDs, no log levels by env. Needed for debugging at scale (pairs with Sentry).
- **Error handling** *(Medium)* — mostly good (proper Nest exceptions now, 402 for limits). Missing
  a global exception filter to normalize error shape + report to Sentry.
- **No request validation on params** *(Low)* — route `:id` params aren't validated as UUIDs
  (a bad id hits Prisma and 500s instead of 400/404). Add a UUID pipe.
- **Health** *(Low)* — `/health` is liveness only; add a readiness check (DB ping) for Cloud Run.

## 8. Database Review

- **Schema quality** *(Good)* — sensible relations, cascades, enums; reasonable indexes
  (`userId,createdAt`, `status,updatedAt` for the sweep).
- **Search not indexed** *(High at scale)* — `q` does `ILIKE %…%` across 5 fields incl. joined
  tags/transcript/enhanced. No index can serve leading-wildcard `ILIKE`; this table-scans. Move to
  Postgres **full-text (`tsvector` + GIN)**, or `pg_trgm` GIN for fuzzy. Becomes necessary at a few
  thousand notes.
- **One recording per note** *(High, product)* — `Recording.noteId @unique`. See Product §3.
- **No soft-delete / trash** *(Medium)* — deletes are hard + cascade. Add `deletedAt` for a trash
  + recovery story (and safer storage cleanup).
- **No `AiRun`/eval tables** *(High, for the AI brief)* — needed for token/cost tracking + evals.
- **RLS** *(Medium)* — tables have RLS enabled with no policies; the backend uses the service role
  and bypasses it. That's the intended backend-gateway model and is safe **as long as the anon/
  publishable key never gets direct table access** — document this explicitly and add a test.
- **Naming** *(Low)* — `@@map` to snake_case tables, camelCase quoted columns. Consistent; fine.

## 9. Security Review  *(treat as a real audit)*

- **Stored XSS via `dangerouslySetInnerHTML`** *(Critical, S–M)* — `note-view.tsx` renders
  `originalContent`, `latestEnhanced`, and (the enhanced) HTML directly. `originalContent` is
  user-authored (Tiptap) and the enhanced HTML is **model output** — both are injected without
  sanitization. A crafted note or a prompt-injected model response could execute script in the
  victim's session. **Fix:** sanitize on render with DOMPurify (allowlist the same tags the prompt
  emits: h3/p/ul/li/strong/em), and ideally sanitize-on-store too. This is the #1 security item.
- **No rate limiting / abuse prevention** *(Critical, S)* — see Backend. Cost + DoS exposure on AI.
- **Dev login with hard-coded credentials in the client** *(High, S)* — `DEMO_EMAIL`/`DEMO_PASSWORD`
  ship in the JS bundle. Gate behind `NEXT_PUBLIC_ENABLE_DEMO` and strip for production builds.
- **Upload validation** *(High, S)* — attachment `sign` trusts client `mimeType` and only caps size
  (50 MB). No server-side MIME allowlist, no content sniffing, no per-file-type limits. A user can
  upload anything and label it an image. Add an allowlist + size-by-kind, and set
  `Content-Disposition`/content-type on download.
- **No global 401 handling** *(Medium)* — expired sessions surface as generic errors.
- **CORS** *(Medium)* — env-driven (good) but defaults to localhost; ensure prod origins are set and
  not `*`.
- **Secrets** *(Good)* — server secrets in gitignored `.env`; the Gemini/Supabase secret keys never
  reach the client. The unused `SUPABASE_JWT_SECRET` placeholder can be removed.
- **CSRF** *(Low)* — bearer-token APIs (not cookie auth) aren't CSRF-prone; fine.
- **Dependency/secret scanning** *(Medium)* — add `pnpm audit`/Dependabot + secret scanning to CI.

## 10. AI Review

- **Prompts hard-coded & unversioned** *(High)* — in `gemini.service.ts`. No version stamped on
  outputs → you can't compare prompt changes or roll back. The Prompt-Versioning workstream fixes
  this; stamp `promptVersion` on `EnhancedNoteVersion` and `ProcessingJob`.
- **No LLM observability** *(High)* — no trace of prompt/input/output/latency/tokens/cost/errors.
  Langfuse workstream.
- **No evals / faithfulness check** *(High)* — the product promise is "preserves your intent," but
  nothing measures it. Add the eval framework (store metrics + an automated faithfulness/hallucination
  score per run).
- **Hallucination guardrails** *(Medium)* — the enhance prompt has good "do not invent" rules and
  the original is preserved (strong), but enhanced HTML isn't sanitized (see XSS) and isn't
  validated against an allowed-tag set server-side. Add output validation.
- **Robustness** *(Medium)* — no timeout/cancellation on Gemini calls; Files-API polling waits up
  to 30s on the worker. No model fallback. Token usage uncapped per request.
- **Structured output** *(Good)* — `organise()` parses strict JSON defensively. Enhance could move
  to a schema-constrained response too.

## 11. Performance Review

- **Perceived speed** *(High)* — the app *feels* slow because: (a) Tiptap inflates the editor routes
  (~280 kB first load), (b) no motion to mask transitions, (c) 2.5–3 s polling, (d) no route
  prefetch/optimistic warmth. **Fixes:** dynamic-import Tiptap, add transitions, switch processing
  updates to fewer polls or SSE, prefetch likely routes.
- **Images** *(Medium)* — attachments render via raw `<img>` of full-size signed URLs (no
  `next/image`, no resizing/thumbnails). Add `next/image` with Supabase `remotePatterns`, generate
  thumbnails, lazy-load.
- **Backend** *(Medium)* — synchronous Gemini work on the worker; fine now, but see Scalability.
- **Caching** *(Medium)* — no HTTP caching headers, no CDN strategy for signed assets, no query
  result caching. TanStack staleTimes are mostly default.
- **DB** *(High at scale)* — search scan (above); also `recordingsToday` counts on every entitlement
  resolve (cheap now, index-backed later).
- **Bundle** *(Medium)* — audit with `@next/bundle-analyzer`; code-split heavy routes.

## 12. Scalability Review  *(when each matters)*

- **Job queue is not multi-instance safe** *(Critical for horizontal scale, M)* — the in-process
  `@Interval` sweep + per-instance `inFlight` Set means **two Cloud Run instances will both claim
  the same queued job**. Safe today (1 instance); breaks the moment you scale out. Options: (a) a
  DB claim with `UPDATE … WHERE status='queued' … RETURNING` / `SELECT FOR UPDATE SKIP LOCKED`, or
  (b) move to a real queue (BullMQ + Redis, or Cloud Tasks/PubSub). Needed before scaling instances.
- **Search** *(High at ~thousands of notes)* — tsvector/trgm (above).
- **Storage growth** *(Medium)* — recordings + attachments accumulate with no lifecycle policy or
  per-user accounting beyond the quota check; add cleanup + usage rollups.
- **Realtime** *(Low / nice-to-have)* — processing status via SSE/WebSocket (or Supabase Realtime)
  would beat polling once many notes process concurrently.
- **AI cost** *(High as usage grows)* — no cost tracking today; the eval/Langfuse work makes cost
  visible; caching identical enhancements and the booster/tier caps contain it.
- **Avoid premature optimization:** Redis/queue and tsvector are *not* needed at current scale —
  but the queue's correctness bug should be fixed *before* you ever set Cloud Run min/max > 1.

## 13. Code Quality Review

- **Duplication** *(Medium)* — ownership checks (backend), record-upload + 402 handling (frontend),
  the per-page "Loading…" splash (now mostly via AuthGuard). Extract shared helpers.
- **Inline styles** *(Medium)* — pervasive; move to component classes for consistency + smaller DOM.
- **Dead code** *(Low)* — `enhancing-overlay.tsx` is now unused; Zustand dep unused.
- **Naming/readability** *(Good)* — clear, well-commented, consistent.
- **Tests** *(High)* — 21 backend unit tests (good for services); **0 frontend tests, 0 E2E.**

## 14. Developer Experience Review

- **Docs** *(Medium)* — strong `docs/` suite (PRD, FLOWS, PHASES, STANDARDS, CONTEXT, DESIGN), but
  **no per-module READMEs** and none of the requested ANALYTICS/OBSERVABILITY/AI_MONITORING docs.
- **Testing** *(High)* — no frontend/E2E harness; add Vitest + React Testing Library (frontend) and
  Playwright (E2E for auth, note CRUD, record→enhance, search).
- **CI/CD** *(Medium)* — GitHub Actions runs lint/typecheck/test/build (good). No deploy pipeline
  (Vercel/Cloud Run), no coverage gate, no preview envs, no `pnpm audit`.
- **Local setup** *(Good)* — Makefile, `.env.example`, docker-compose for Postgres.
- **A recurring footgun** *(noted)* — running `next build` against a live `pnpm dev` clobbers
  `.next`. Documented; CI should be the only place full builds run.

## 15. Risk Assessment

| Risk | Likelihood | Impact | Severity |
|---|---|---|---|
| Stored XSS via unsanitized HTML | High | High | **Critical** |
| AI/endpoint abuse (no rate limit) → cost + DoS | Medium | High | **Critical** |
| Duplicate job processing when scaled out | High (on scale) | High | **Critical** |
| Demo creds in client bundle reach prod | Medium | Medium | **High** |
| Unvalidated uploads (type/content) | Medium | Medium | **High** |
| No observability → blind to failures/cost | High | High | **High** |
| Search degrades at scale | High (later) | Medium | **High** |
| No tests → regressions ship silently | High | Medium | **High** |
| Mobile/polish gaps hurt adoption | High | Medium | **Medium** |

---

## 16. Prioritized Improvement Roadmap

Severity · Effort · Impact(1–5). Grouped into workstreams; ordered for sequencing.

### A. Security & correctness hardening *(do first)*
| # | Item | Sev | Eff | Imp |
|---|---|---|---|---|
| A1 | Sanitize all rendered HTML (DOMPurify, allowlist) | Critical | S | 5 |
| A2 | Global rate limiting (`@nestjs/throttler`) + tight AI/upload caps | Critical | S | 5 |
| A3 | Gate/strip demo login for production | High | S | 4 |
| A4 | Server-side upload validation (MIME allowlist, size-by-kind) | High | S | 4 |
| A5 | Global exception filter + 401 handling + UUID param pipe | High | M | 4 |
| A6 | Make the job queue claim safe (`SKIP LOCKED`) before scaling out | Critical* | M | 5 |

### B. The bugs you reported *(quick wins)*
| # | Item | Sev | Eff | Imp |
|---|---|---|---|---|
| B1 | Fix file upload (verify attachments bucket/policy + flow end-to-end) | Critical | S | 5 |
| B2 | "Multiple recordings" — decide model (multi-per-note) + implement | High | M | 4 |
| B3 | Account page (profile, plan, **usage metrics**, sign out, delete account) | High | M | 4 |
| B4 | Mobile-responsive pass on every route | High | M | 4 |
| B5 | Motion/transitions system (reduced-motion aware) | High | M | 4 |
| B6 | Homepage redesign to brand (editorial/illustrative) | High | M | 4 |
| B7 | Perceived-speed pass (code-split Tiptap, prefetch, fewer polls) | High | M | 4 |

### C. Observability & integrations *(your second brief — recommended order)*
| # | Item | Sev | Eff | Imp |
|---|---|---|---|---|
| C0 | Centralized config (envs for dev/staging/prod) | High | S | 4 |
| C1 | **PostHog** — typed analytics service, identify, page views, core events | High | M | 5 |
| C2 | **Sentry** — FE + BE error/perf, context (user/note/job/release) | High | M | 5 |
| C3 | **Resend** — email service + React Email templates (welcome/verify/failed) | Medium | M | 3 |
| C4 | **Langfuse** — trace every AI call (prompt/version/tokens/cost/latency) | High | M | 4 |
| C5 | **AI evals** — `AiRun` + `AiEvaluation` tables, automatic faithfulness scoring | High | L | 4 |
| C6 | **Prompt versioning** — registry; stamp version on outputs; A/B-ready | High | M | 4 |
| C7 | Docs: ANALYTICS.md, OBSERVABILITY.md, AI_MONITORING.md | Medium | S | 3 |

### D. Quality & scale *(as you grow)*
| # | Item | Sev | Eff | Imp |
|---|---|---|---|---|
| D1 | Postgres full-text search (tsvector + GIN) | High (later) | M | 4 |
| D2 | Frontend unit tests (Vitest + RTL) + Playwright E2E | High | L | 4 |
| D3 | Accessibility pass (focus traps, labels, contrast, keyboard) | High | M | 4 |
| D4 | Soft-delete / Trash + storage lifecycle | Medium | M | 3 |
| D5 | next/image + thumbnails for attachments | Medium | S | 3 |
| D6 | Remove dead deps/code; extract shared ownership + inline-style cleanup | Medium | M | 3 |
| D7 | Deploy pipelines (Vercel + Cloud Run) + coverage + `pnpm audit` in CI | Medium | M | 3 |

\* A6 is Critical only once you run >1 backend instance; until then it's High.

---

## User tracking / analytics tooling (your question)

**Use PostHog** — it's the open-source, self-hostable product-analytics platform and it covers
exactly "who is doing what and how": event analytics, user identification, **session replay**,
funnels, retention, heatmaps, feature flags, and surveys. Free cloud tier (generous) or self-host
for full data ownership. It's already in your integration brief — it's the right pick.

Lighter, privacy-first **web-only** alternatives (no replay/funnels/flags): **Umami** or
**Plausible** (both OSS, self-hostable). Use one of these *instead* only if you want simple page
analytics and nothing else. For your goals, PostHog is the answer.

Pair it with: **Sentry** (errors/perf — OSS, free tier), **Langfuse** (LLM tracing/evals — OSS,
free tier). All three are open-source with hosted free tiers, so you can start hosted and self-host
later without code changes.
