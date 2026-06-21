'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/** Tracks the current Supabase auth session and keeps it fresh. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let settled = false;
    const finish = (next: Session | null) => {
      setSession(next);
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    // onAuthStateChange fires INITIAL_SESSION immediately, so it's the most reliable
    // signal. getSession() is a backup; both resolve loading.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => finish(next));

    supabase.auth
      .getSession()
      .then(({ data }) => finish(data.session))
      .catch(() => finish(null));

    // Safety net: never leave the UI stuck on "Loading…" if the auth lock stalls.
    // Only release loading — keep whatever session the listener already gave us.
    const timer = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
