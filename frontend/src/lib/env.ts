/** Public runtime config. Only NEXT_PUBLIC_* values are available in the browser. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Supabase's new key system uses a "publishable" key; older projects use "anon".
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

// PostHog product analytics. Optional — the app runs fine without it (analytics
// becomes a no-op). Host defaults to PostHog Cloud US.
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export const env = {
  supabaseUrl,
  supabaseKey,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  posthogKey,
  posthogHost,
};

/** True once a real Supabase project is configured (not a placeholder). */
export const isSupabaseConfigured =
  !!supabaseUrl &&
  !supabaseUrl.includes('YOUR_PROJECT_REF') &&
  !!supabaseKey &&
  !supabaseKey.startsWith('placeholder');

/** True once a PostHog key is present. Analytics is a no-op otherwise. */
export const isAnalyticsConfigured = !!posthogKey;
