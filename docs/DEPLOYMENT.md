# Deployment

## Scope: DEV environment first
This guide stands up the **dev** environment on free tiers:
- **Frontend → Vercel** (Hobby/free)
- **Backend → Render** (free web service, Docker)
- **Database/Auth/Storage → existing dev Supabase** project `iohmtxsvrymrazyyakdo`
- **PostHog / Sentry / Langfuse / Resend** → existing dev keys

Prod comes later on sturdier infra — see [Prod, later](#prod-later). Deploy from the
**`develop`** branch.

> **One-time:** flip the GitHub default branch to **`main`** (Settings → Branches),
> then `master` can be deleted. `main` = release line, `develop` = integration.

---

## 1. Backend on Render (Docker)

The backend is a pnpm-workspace package (depends on `@nenap/types`), so the Docker
build context must be the **repo root**. A [backend/Dockerfile](../backend/Dockerfile)
is provided.

**Create the service:**
1. Render → **New → Web Service** → connect the GitHub repo.
2. Branch: **`develop`**. Runtime: **Docker**.
3. **Dockerfile Path:** `backend/Dockerfile` · **Docker Build Context Directory:** `.` (repo root)
4. Instance type: **Free** (single instance — matches our "pin to 1 instance" choice, so the in-process job queue stays safe).
5. **Health Check Path:** `/health`
6. Add the env vars below → **Create**. Copy the service URL (e.g. `https://nenap-backend.onrender.com`).

**Backend env vars (Render):**

| Var | Value (dev) |
|---|---|
| `DATABASE_URL` | dev Supabase **pooled** string (`...pooler...:6543/postgres?pgbouncer=true`) |
| `DIRECT_URL` | dev Supabase direct (`:5432`) — only used by migrations |
| `SUPABASE_URL` | `https://iohmtxsvrymrazyyakdo.supabase.co` |
| `SUPABASE_SECRET_KEY` | `sb_secret_…` |
| `SUPABASE_SERVICE_ROLE_KEY` | (current value) |
| `SUPABASE_JWT_SECRET` | (current value) |
| `RECORDINGS_BUCKET` | `recordings` |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | (current values) |
| `CORS_ORIGINS` | **the Vercel URL** (set after step 2) |
| `APP_URL` | the Vercel URL (email links) |
| `POSTHOG_KEY` / `POSTHOG_HOST` | dev PostHog key / `https://eu.i.posthog.com` |
| `SENTRY_DSN` | backend DSN · `SENTRY_ENVIRONMENT=development` |
| `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` / `LANGFUSE_BASEURL` | dev Langfuse keys / `https://cloud.langfuse.com` |

> `PORT` is injected by Render automatically — `main.ts` honours it. `NODE_ENV=production`
> is set by the Dockerfile.

> **Migrations:** the dev DB is already migrated (via Supabase), so the image does **not**
> run migrations on boot. (Prod will need Prisma migration baselining — see below.)

> **Free-tier note:** the service sleeps after ~15 min idle (≈30–60s cold start on the
> next request). Background AI processing still completes because Render keeps the
> instance alive ~15 min after each request.

---

## 2. Frontend on Vercel

1. Vercel → **Add New → Project** → import the repo.
2. **Root Directory:** `frontend` (Vercel builds just the Next.js app; `@nenap/types`
   is handled via `transpilePackages`).
3. Framework preset: **Next.js** (auto-detected). Production branch: **`develop`**.
4. Add the env vars below → **Deploy**. Copy the URL (e.g. `https://nenap-dev.vercel.app`).

**Frontend env vars (Vercel):**

| Var | Value (dev) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://iohmtxsvrymrazyyakdo.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_…` |
| `NEXT_PUBLIC_API_URL` | **the Render backend URL** |
| `NEXT_PUBLIC_SITE_URL` | the Vercel URL |
| `NEXT_PUBLIC_ENABLE_DEMO` | `true` (dev only) |
| `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD` | demo creds |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | dev PostHog key / `https://eu.i.posthog.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | frontend DSN · `NEXT_PUBLIC_SENTRY_ENVIRONMENT=development` |

---

## 3. Cross-wiring (the order matters)

There's a chicken-and-egg between the two URLs. Do it in this order:
1. **Deploy backend** → get the Render URL.
2. **Deploy frontend** with `NEXT_PUBLIC_API_URL` = Render URL → get the Vercel URL.
3. **Set backend `CORS_ORIGINS`** = Vercel URL (and `APP_URL`) → backend redeploys.
4. **Supabase → Authentication → URL Configuration:** add the Vercel URL as **Site URL**
   and to **Redirect URLs** (`https://<vercel-url>/**`) so email-confirmation/login links work.

Then open the Vercel URL, sign in (or use the demo button), create a note — and confirm
events land in PostHog and any errors in Sentry.

---

## 4. CI

[.github/workflows/ci.yml](../.github/workflows/ci.yml) runs typecheck + lint + tests +
build on every PR/push to `main`/`develop`. Render and Vercel deploy on push to the
connected branch (`develop`). Recommended: protect `main` to require CI green + PR.

---

## Prod, later

When promoting to prod on sturdier infra:
- **Separate Supabase project** (isolated data) + buckets + RLS + migrations.
- **Prisma migration baselining** — the dev DB was migrated via Supabase tooling, so its
  history doesn't match Prisma's `migrations/` folders. Before `prisma migrate deploy`
  works, baseline with `prisma migrate resolve --applied <name>` for each existing
  migration (or start the prod DB clean via `migrate deploy`).
- **Harden:** demo login OFF, real Resend sending domain, Sentry source-map upload
  (`SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`), PostHog reverse-proxy, prod CORS,
  `*_ENVIRONMENT=production`.
- See [RELEASE_PLAN.md](./RELEASE_PLAN.md) M2–M3 for the full list.
