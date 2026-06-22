import * as dotenv from 'dotenv';
import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

/**
 * Sentry must be initialised before anything else loads, so this file is imported
 * as the very first line of main.ts (before Nest, before reflect-metadata).
 *
 * This runs BEFORE Nest's ConfigModule loads .env, so process.env.SENTRY_DSN would
 * otherwise be undefined here and Sentry would silently never initialise. We load
 * .env ourselves first. Env-gated: with no SENTRY_DSN, init is skipped (no-op).
 */
dotenv.config();

const dsn = process.env.SENTRY_DSN;
// Surfaced at boot (before Nest's Logger exists) so it's obvious whether Sentry is on.
console.log(`[instrument] Sentry ${dsn ? 'initialising (DSN present)' : 'disabled (no SENTRY_DSN)'}`);

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? 'development',
    // Send structured logs to Sentry (server-side).
    enableLogs: true,
    // Performance tracing — sample sparingly in prod; override via env.
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    // Node profiling: capture CPU/memory usage on sampled transactions.
    // Profiling data attached to all spans (unless sampled out).
    integrations: [nodeProfilingIntegration()],
    profileSessionSampleRate: Number(process.env.SENTRY_PROFILE_SESSION_SAMPLE_RATE ?? 0.1),
    // Enable profiling during active traces (automatic).
    profileLifecycle: 'trace',
    dataCollection: {
      // To disable sending user data and HTTP bodies, uncomment and set to false/[].
      // For more info: https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#dataCollection
      // userInfo: false,
      // httpBodies: [],
    },
  });
}
