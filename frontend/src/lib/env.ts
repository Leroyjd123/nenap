/** Public runtime config. Only NEXT_PUBLIC_* values are available in the browser. */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// Supabase's new key system uses a "publishable" key; older projects use "anon".
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  '';

export const env = {
  supabaseUrl,
  supabaseKey,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
};

/** True once a real Supabase project is configured (not a placeholder). */
export const isSupabaseConfigured =
  !!supabaseUrl &&
  !supabaseUrl.includes('YOUR_PROJECT_REF') &&
  !!supabaseKey &&
  !supabaseKey.startsWith('placeholder');
