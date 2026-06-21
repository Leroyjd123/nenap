'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * Catches errors in the root layout/template. Reports to Sentry (a no-op without a
 * DSN) and shows a calm fallback. App-level errors are handled by route error.tsx.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui, sans-serif', background: '#faf8f2', color: '#2a2823' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Something went quiet.</h1>
          <p style={{ color: '#6b6862', marginTop: 8 }}>An unexpected error occurred. Try again in a moment.</p>
          <button
            onClick={() => window.location.assign('/')}
            style={{ marginTop: 16, padding: '8px 16px', borderRadius: 8, border: '1px solid #d8d3c7', background: '#fffdf8', cursor: 'pointer' }}
          >
            Back to Nenap
          </button>
        </div>
      </body>
    </html>
  );
}
