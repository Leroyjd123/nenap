# Observability (Sentry)

Nenap uses [Sentry](https://sentry.io) for error tracking and performance tracing
across the backend (NestJS) and frontend (Next.js). It surfaces crashes, failed
background jobs, and slow requests with full stack traces and context.

Like analytics, Sentry is **entirely optional**. With no DSN configured, the SDK
never initialises and every call is a safe no-op — local dev, CI, and tests run
identically. It only starts reporting once you supply a DSN.

## Setup

1. Create a project at [sentry.io](https://sentry.io) (one for the backend "node"
   platform, one for the frontend "Next.js" platform, or a single project — your call).
2. Copy each project's **DSN** (Project Settings → Client Keys).
3. Set the DSNs:

   **`backend/.env`**
   ```
   SENTRY_DSN="https://...@oXXX.ingest.sentry.io/XXX"
   SENTRY_ENVIRONMENT="production"     # optional; defaults to NODE_ENV
   SENTRY_TRACES_SAMPLE_RATE="0.1"     # 10% of requests traced
   ```

   **`frontend/.env.local`**
   ```
   NEXT_PUBLIC_SENTRY_DSN="https://...@oXXX.ingest.sentry.io/YYY"
   NEXT_PUBLIC_SENTRY_ENVIRONMENT="production"
   NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE="0.1"
   ```

4. Restart both dev servers.

### Source maps (production only)

So production stack traces point at real source, set these for the frontend build
(CI/prod). Without them the build simply skips upload — nothing breaks.
```
SENTRY_ORG="your-org-slug"
SENTRY_PROJECT="your-frontend-project-slug"
SENTRY_AUTH_TOKEN="sntrys_..."   # Sentry → Settings → Auth Tokens
```

## Architecture

### Backend (`@sentry/nestjs`)

| Piece | File | Role |
| --- | --- | --- |
| Init | [`backend/src/instrument.ts`](../backend/src/instrument.ts) | `Sentry.init`, DSN-gated. Imported as the **first line** of `main.ts` (before Nest/reflect-metadata). |
| Module | `SentryModule.forRoot()` in [`app.module.ts`](../backend/src/app.module.ts) | First import, so it instruments every module below it. |
| Error capture | `SentryGlobalFilter` (APP_FILTER) | Captures unhandled exceptions, then delegates to Nest's default handling — **HTTP responses are unchanged**. |

`instrument.ts` reads `process.env` directly because it runs before `ConfigModule`
validates. The same keys are also declared in `config/env.ts` for documentation and
validation.

### Frontend (`@sentry/nextjs`)

| Piece | File | Role |
| --- | --- | --- |
| Server/edge init | [`src/instrumentation.ts`](../frontend/src/instrumentation.ts) | `register()` inits Sentry for the Node/Edge runtimes; `onRequestError` captures RSC errors. |
| Browser init | [`src/instrumentation-client.ts`](../frontend/src/instrumentation-client.ts) | Browser `Sentry.init`; `onRouterTransitionStart` traces client navigations. |
| Render errors | [`src/app/global-error.tsx`](../frontend/src/app/global-error.tsx) | Reports root layout/template crashes and shows a calm fallback. |
| Build wrapper | `withSentryConfig` in [`next.config.ts`](../frontend/next.config.ts) | Source-map upload + ad-blocker tunnel at `/monitoring`. Inert without an auth token. |

Session Replay is intentionally **off** to keep the bundle light and the experience
calm — enable it in `instrumentation-client.ts` later if wanted.

## How it pairs with analytics

Sentry answers *"what broke and why"*; PostHog (see [ANALYTICS.md](./ANALYTICS.md))
answers *"who did what"*. They complement each other: the `note_processing_failed`
PostHog event tells you a job failed and for whom; the matching Sentry issue gives
you the stack trace to fix it.

## Verifying it works

- **Backend**: throw in any controller, hit the route, confirm the issue appears in
  Sentry (the response is still a normal 500).
- **Frontend**: `throw new Error('sentry test')` in a client component; the
  `global-error` fallback shows and the error lands in Sentry.
- To disable in any environment, unset the DSN.
