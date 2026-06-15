/** Public runtime config. Only NEXT_PUBLIC_* values are available in the browser. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
};

/** True once a real Supabase project is configured (not the placeholder). */
export const isSupabaseConfigured =
  !!env.supabaseUrl &&
  !env.supabaseUrl.includes('YOUR_PROJECT_REF') &&
  !!env.supabaseAnonKey &&
  env.supabaseAnonKey !== 'placeholder-anon-key';
