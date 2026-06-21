import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @nenap/types ships TS source consumed via the workspace build output.
  transpilePackages: ['@nenap/types'],
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
