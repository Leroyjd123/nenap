import * as Sentry from '@sentry/nextjs';

// Browser Sentry init. This file (at the project root) is the convention Next.js
// < 15.3 supports — `instrumentation-client.ts` is only picked up from Next 15.3+,
// and this project is on 15.1.4. withSentryConfig injects this into the client bundle.
//
// Env-gated: a no-op without NEXT_PUBLIC_SENTRY_DSN. Session Replay is intentionally
// left off to keep the bundle light and the experience calm.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}
