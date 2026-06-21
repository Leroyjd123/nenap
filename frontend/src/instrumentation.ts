import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * Server/edge Sentry init. Next calls this once per runtime at startup.
 * Env-gated: with no NEXT_PUBLIC_SENTRY_DSN, init is skipped and the SDK stays a no-op.
 */
export async function register() {
  if (!dsn) return;
  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
      tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    });
  }
}

// Captures errors thrown in nested React Server Components.
export const onRequestError = Sentry.captureRequestError;
