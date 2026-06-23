'use client';

import posthog from 'posthog-js';
import { env, isAnalyticsConfigured } from '@/lib/env';

/**
 * Thin facade over PostHog. The rest of the app calls these helpers rather than
 * importing posthog-js directly, so analytics stays swappable and every call is a
 * safe no-op when PostHog isn't configured (local dev without a key, tests, SSR).
 */

let started = false;

/** Initialise PostHog once, on the client, only when a key is configured. */
export function initAnalytics() {
  if (started || !isAnalyticsConfigured || typeof window === 'undefined') return;
  started = true;
  posthog.init(env.posthogKey, {
    // Same-origin reverse proxy (see next.config rewrites) so ad-blockers can't
    // drop events. ui_host points at the real PostHog app for toolbar/links.
    api_host: '/ingest',
    ui_host: env.posthogHost.replace('.i.posthog.com', '.posthog.com'),
    person_profiles: 'identified_only',
    // We send $pageview manually on route change (Next App Router soft nav).
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
  });
}

function ready() {
  return started && isAnalyticsConfigured && typeof window !== 'undefined';
}

/** Product events we track. Keep this list small and intentional. */
export type AnalyticsEvent =
  | 'note_created'
  | 'note_saved'
  | 'recording_added'
  | 'note_improved'
  | 'attachment_added'
  | 'plan_viewed';

export function capture(event: AnalyticsEvent, props?: Record<string, unknown>) {
  if (!ready()) return;
  posthog.capture(event, props);
}

export function capturePageview(url: string) {
  if (!ready()) return;
  posthog.capture('$pageview', { $current_url: url });
}

/** Associate subsequent events with a signed-in user. */
export function identify(userId: string, traits?: Record<string, unknown>) {
  if (!ready()) return;
  posthog.identify(userId, traits);
}

/** Clear identity on sign-out so events aren't attributed to the wrong person. */
export function resetAnalytics() {
  if (!ready()) return;
  posthog.reset();
}
