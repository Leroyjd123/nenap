'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import { capturePageview, identify, initAnalytics, resetAnalytics } from '@/lib/analytics';

/** Sends a $pageview on every route change. Reads search params, so it must sit in Suspense. */
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const qs = searchParams.toString();
    capturePageview(window.location.origin + pathname + (qs ? `?${qs}` : ''));
  }, [pathname, searchParams]);

  return null;
}

/** Identifies the signed-in user and clears identity on sign-out. */
function IdentityTracker() {
  const { session, loading } = useSession();

  useEffect(() => {
    if (loading) return;
    if (session?.user) {
      identify(session.user.id, { email: session.user.email });
    } else {
      resetAnalytics();
    }
  }, [session, loading]);

  return null;
}

/**
 * Boots PostHog and keeps pageviews + user identity in sync. A no-op when PostHog
 * isn't configured, so it's safe to mount unconditionally around the whole app.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <IdentityTracker />
      {children}
    </>
  );
}
