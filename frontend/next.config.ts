import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// PostHog reverse proxy: serve analytics from our own origin under /ingest so
// ad-blockers (which block *.posthog.com) can't drop events. Region-derived from
// the configured host (EU: eu.i / eu-assets.i; US: us.i / us-assets.i).
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
const posthogAssets = posthogHost.replace('.i.posthog.com', '-assets.i.posthog.com');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @nenap/types ships TS source consumed via the workspace build output.
  transpilePackages: ['@nenap/types'],
  // Needed so the /ingest/* proxy paths aren't trailing-slash redirected.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // Static assets (recorder.js, surveys, etc.) come from the assets host.
      { source: '/ingest/static/:path*', destination: `${posthogAssets}/static/:path*` },
      // Everything else (event capture, flags, decide) goes to the ingest host.
      { source: '/ingest/:path*', destination: `${posthogHost}/:path*` },
    ];
  },
};

// Sentry build wrapper. Source maps upload only when SENTRY_AUTH_TOKEN is set
// (CI/prod); without it this is inert, so local dev is unaffected.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  // Route browser error/tracing requests through Next to dodge ad-blockers.
  tunnelRoute: '/monitoring',
  // Tree-shake Sentry's internal debug logging out of the production bundle.
  bundleSizeOptimizations: { excludeDebugStatements: true },
});
