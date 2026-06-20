'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

// DEV-ONLY demo account — remove before production.
const DEMO_EMAIL = 'ljdstore@yopmail.com';
const DEMO_PASSWORD = 'NenapDemo123!';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  // DEV-ONLY: one-click sign-in to the shared demo account.
  async function handleDemo() {
    setError(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push('/');
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Sign-in is available once Supabase is connected. Hang tight.');
      return;
    }

    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (authError) {
          setError(authError.message);
          return;
        }
        // With email confirmation on, no session is returned until the link is clicked.
        if (!data.session) {
          setSentTo(email);
          return;
        }
        router.push('/'); // confirmation disabled → already signed in
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(authError.message);
          return;
        }
        router.push('/');
      }
    } finally {
      setBusy(false);
    }
  }

  // Post-signup: calm "check your inbox" confirmation (no silent redirect).
  if (sentTo) {
    return (
      <main className="min-h-screen grid place-items-center px-5 py-16">
        <div className="w-full max-w-[400px] text-center flex flex-col items-center">
          <Brand className="text-[34px] mb-5" />
          <div
            className="w-14 h-14 rounded-full grid place-items-center mb-4"
            style={{ background: 'var(--accent-tint)' }}
            aria-hidden
          >
            <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />
          </div>
          <h1 className="font-display text-[22px] font-medium text-ink m-0">Check your inbox</h1>
          <p className="text-ink-2 text-sm mt-2 leading-relaxed">
            We sent a confirmation link to <span className="text-ink font-semibold">{sentTo}</span>.
            Click it to finish creating your account.
          </p>
          <button
            type="button"
            className="text-accent-deep font-semibold text-sm mt-6 hover:underline"
            onClick={() => {
              setSentTo(null);
              setMode('signin');
            }}
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen grid place-items-center px-5 py-16">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center text-center mb-8">
          <Brand className="text-[34px] mb-4" />
          <h1 className="font-display text-[22px] font-medium text-ink m-0">
            {mode === 'signin' ? 'Welcome back' : 'Make a little space to remember'}
          </h1>
          <p className="text-ink-2 text-sm mt-2 leading-relaxed">
            Focus on the moment. Nenap remembers the rest.
          </p>
        </div>

        <div className="bg-surface border border-line rounded-[var(--r)] shadow-1 p-6">
          {/* Google — wired but dormant until Google OAuth is configured */}
          <Button
            variant="soft"
            size="block"
            type="button"
            disabled
            title="Google sign-in arrives once it's configured"
          >
            Continue with Google
            <span className="eyebrow ml-1">soon</span>
          </Button>

          <div className="flex items-center gap-3 my-4 text-ink-3">
            <span className="h-px flex-1 bg-line" />
            <span className="eyebrow">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              minLength={6}
            />

            {error && <p className="text-rec text-[13px] m-0">{error}</p>}

            <Button type="submit" size="block" disabled={busy}>
              {busy ? 'One moment…' : mode === 'signin' ? 'Continue with email' : 'Create account'}
            </Button>
          </form>

          {!isSupabaseConfigured && (
            <p className="text-ink-3 text-[12px] text-center mt-4 leading-relaxed">
              Auth is inert until Supabase is connected — the screen is real, the keys aren&apos;t yet.
            </p>
          )}
        </div>

        {/* DEV-ONLY demo access — remove before production */}
        <button
          type="button"
          onClick={handleDemo}
          disabled={busy}
          className="mt-4 w-full text-center text-[12px] font-mono tracking-[0.04em] text-ink-3
                     hover:text-accent-deep transition-colors"
        >
          ↳ continue to demo account (dev only)
        </button>

        <p className="text-center text-sm text-ink-2 mt-6">
          {mode === 'signin' ? 'New to Nenap?' : 'Already have an account?'}{' '}
          <button
            type="button"
            className="text-accent-deep font-semibold hover:underline"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </main>
  );
}
