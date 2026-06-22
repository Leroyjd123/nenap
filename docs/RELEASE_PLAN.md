# Nenap — Release & Deployment Plan

Living document for getting Nenap to a clean production launch with separate **dev**
and **prod** environments and proper versioning.

## Status legend
`[ ]` todo · `[~]` in progress · `[x]` done

---

## A. Pending work (prioritized)

### 🔴 Blockers — must be green to build/ship
- [~] **M1.1** Fix `use-autosave.ts` type errors (`tsc`/`next build` fails). _S_
- [~] **M1.2** Autosave — **finish properly** (fix build + timestamp-based draft recovery + drop `any`). _M_
- [~] **M1.3** Full-text search — **revert** the half-done infra (unapplied migration with a timestamp that predates `init`, would break `prisma migrate deploy`; query never wired). Working ILIKE search stays. Redo FTS cleanly post-launch. _S_

### 🟠 Pre-launch hardening
- [~] **M1.4** Strip debug scaffolding: `/test-error` page, `/debug-sentry` endpoint. _S_
- [ ] **M2.1** Prod config: demo login **off**, CORS = prod domain, Sentry source-map upload (`SENTRY_AUTH_TOKEN`), PostHog reverse-proxy (ad-blocker resilience), rate-limit review. _M_
- [ ] **M2.2** Security A5 — UUID param validation + consistent 401s (global filter partly done via Sentry). _M_
- [ ] **M2.3** Security A6 — job-queue multi-instance safety (in-process `@Interval` queue duplicates work if backend runs >1 instance). Fix, or pin backend to a single instance. _M–L_
- [ ] **M2.4** Resend — verify a real sending domain (currently `onboarding@resend.dev`). _S + DNS_

### 🟢 Deployment & infra
- [ ] **M3.1** Prod **Supabase** project (isolated data) + buckets + RLS + apply migrations. _M–L_
- [ ] **M3.2** Hosting: Vercel (frontend) + container host (backend); env vars per platform; custom domain + DNS. _L_
- [ ] **M3.3** CI/CD (GitHub Actions): test on PR, deploy dev on merge, deploy prod on tag. _L_
- [ ] **M3.4** Branching + versioning: `develop`/`main`, SemVer tags, branch protection. _S–M_

### 🔵 Quality (post-launch acceptable)
- [ ] **M4.1** Frontend unit tests + Playwright E2E (currently 0 frontend tests). _XL_
- [ ] **M4.2** Deeper a11y pass; `next/image` for attachments; soft-delete/trash. _L each_
- [ ] **M4.3** Re-add full-text search **properly** (clean migration, wire query). _M_

### ⚪ Deferred / optional
- [ ] Stripe (paused Phase C) — only if launching paid tiers; free-only launch defers it.
- [ ] AI evals (Langfuse scores) + prompt versioning (Langfuse Prompt Management).

---

## B. Environments (dev + prod)

| Concern | Dev | Prod |
|---|---|---|
| Supabase | current project `iohmtxsv…` | **separate** project (isolated data) |
| Frontend | Vercel ← `develop` | Vercel ← `main`, custom domain |
| Backend | dev service | prod service, single instance (until A6) |
| Sentry | `environment=development` | `environment=production` + source maps |
| PostHog | dev environment | prod environment + reverse proxy |
| Langfuse | trace `env=dev` | trace `env=prod` |
| Demo login | on | **off** |
| Secrets | host env vars (gitignored locally) | host env vars |

Physically separate **Supabase** (dev must not touch prod data). For PostHog/Sentry/
Langfuse, use environment tags rather than duplicate projects.

---

## C. GitHub versioning & branching

- `main` (prod) — protected; releases deploy from here.
- `develop` (dev) — integration; auto-deploys to dev env.
- Feature branches → PR into `develop` → merge to `main` to release.
- **SemVer tags** (`v0.1.0`…) on `main` + GitHub Releases.
- **Conventional commits** (`feat:`/`fix:`/`perf:`) → auto-changelog.
- Branch protection on `main` (CI green + PR required).

> Note: repo currently uses `master`. Renaming `master`→`main` is optional/cosmetic
> (also update the GitHub default-branch setting). Kept as-is for now; tagging starts at v0.1.0.

---

## D. Milestones → release date

| Milestone | Contents | Rough effort |
|---|---|---|
| **M1 — Green & clean** | build fix, autosave finished, FTS reverted, scaffolding stripped | ~1 day |
| **M2 — Prod-ready** | config hardening, security A5/A6, email domain | ~2–3 days |
| **M3 — Ship it** | prod Supabase, hosting, CI/CD, branching/tags | ~2–3 days |
| **M4 — Post-launch** | tests, a11y, trash, FTS redo, evals | ~1–2 weeks rolling |

**Realistic soft-launch: ~1 week** focused work (M1–M3); quality (M4) follows. Add buffer
for DNS propagation and first-deploy debugging.

---

## E. Open decisions (for M2/M3)
- Backend hosting: Cloud Run / Railway / Render / Fly?
- Launch free-only (defer Stripe) or paid from day one?
- Rename `master`→`main` now, or keep `master`?
