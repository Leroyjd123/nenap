import * as Sentry from '@sentry/nestjs';

/**
 * Sentry must be initialised before anything else loads, so this file is imported
 * as the very first line of main.ts (before Nest, before reflect-metadata).
 *
 * Env-gated: with no SENTRY_DSN, init is skipped entirely and the SDK stays a no-op.
 * We read process.env directly here because this runs before ConfigModule validates.
 */
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
    // Performance tracing — sample sparingly in prod; override via env.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
  });
}
