'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      const fn =
        mode === 'signin'
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password });
      const { error: authError } = await fn;
      if (authError) {
        setError(authError.message);
        return;
      }
      router.push('/');
    } finally {
      setBusy(false);
    }
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
