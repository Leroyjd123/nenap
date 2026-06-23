'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type State = 'working' | 'success' | 'error';

/**
 * Handles the email-confirmation / magic-link redirect. Supabase appends a `code`
 * (PKCE) to this URL; we exchange it for a session, then send the user on to the app.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<State>('working');
  const [message, setMessage] = useState('Confirming your account…');

  useEffect(() => {
    const run = async () => {
      const supabase = getSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const errorDescription = url.searchParams.get('error_description');

      if (errorDescription) {
        setState('error');
        setMessage(errorDescription);
        return;
      }

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        // If no code, detectSessionInUrl may already have set the session.
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error('No session — the link may have expired.');

        setState('success');
        setMessage('You’re all set.');
        window.setTimeout(() => router.replace('/home'), 900);
      } catch (e) {
        setState('error');
        setMessage(e instanceof Error ? e.message : 'Could not confirm your account.');
      }
    };
    void run();
  }, [router]);

  return (
    <main className="min-h-screen grid place-items-center px-5 text-center">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <Brand className="text-[34px] mb-5" />
        <div
          className="w-14 h-14 rounded-full grid place-items-center mb-4"
          style={{ background: state === 'error' ? 'var(--rec-tint)' : 'var(--accent-tint)' }}
          aria-hidden
        >
          <span
            className="w-3 h-3 rounded-full"
            style={{ background: state === 'error' ? 'var(--rec)' : 'var(--accent)' }}
          />
        </div>
        <h1 className="font-display text-[22px] font-medium text-ink m-0">
          {state === 'success' ? 'Welcome to Nenap' : state === 'error' ? 'Something went wrong' : 'One moment…'}
        </h1>
        <p className="text-ink-2 text-sm mt-2 leading-relaxed">{message}</p>
        {state === 'error' && (
          <Button className="mt-6" onClick={() => router.replace('/login')}>
            Back to sign in
          </Button>
        )}
      </div>
    </main>
  );
}
