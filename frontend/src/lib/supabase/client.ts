import { createBrowserClient } from '@supabase/ssr';
import { env } from '../env';

/**
 * Browser Supabase client (singleton). Handles the email/password session and token
 * refresh. Falls back to placeholder values when Supabase isn't configured yet — the
 * client constructs fine but auth calls will error until real credentials are added.
 */
let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (cached) return cached;
  cached = createBrowserClient(
    env.supabaseUrl || 'https://placeholder.supabase.co',
    env.supabaseKey || 'placeholder-key',
  );
  return cached;
}
