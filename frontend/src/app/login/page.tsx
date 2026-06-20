'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

// DEV-ONLY demo account — remove before production.
const DEMO_EMAIL = 'ljdstore@yopmail.com';
const DEMO_PASSWORD = 'NenapDemo123!';

const GRADIENT_BG = {
  background:
    'radial-gradient(900px 500px at 50% -10%, var(--accent-tint), transparent 60%), var(--bg)',
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendNote, setResendNote] = useState<string | null>(null);

  async function handleResend() {
    if (!sentTo) return;
    setResendNote(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.resend({
        type: 'signup',
        email: sentTo,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setResendNote(authError ? authError.message : 'Sent again — check your inbox.');
    } finally {
      setBusy(false);
    }
  }

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
      setError('Sign-in is available once Supabase is connected.');
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
        if (!data.session) {
          setSentTo(email);
          return;
        }
        router.push('/');
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

  if (sentTo) {
    return (
      <main className="screen min-h-screen grid place-items-center px-7 py-10" style={GRADIENT_BG}>
        <div className="col center text-center" style={{ maxWidth: 320, margin: '0 auto' }}>
          <div className="brand" style={{ fontSize: 38, marginBottom: 14 }}>
            Nenap<span className="dot">.</span>
          </div>
          <div className="enh-orb" style={{ width: 56, height: 56, marginBottom: 18 }}>
            <div className="ring" />
            <div className="ring r2" />
            <div className="core" style={{ inset: 14 }}>
              <Icon name="check" size={20} />
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: 0 }}>
            Check your inbox
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
            We sent a confirmation link to <strong style={{ color: 'var(--ink)' }}>{sentTo}</strong>.
            Click it to finish creating your account.
          </p>
          <div className="row center" style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button className="btn btn-soft btn-sm" onClick={handleResend} disabled={busy}>
              {busy ? 'Sending…' : 'Resend email'}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setSentTo(null);
                setResendNote(null);
                setMode('signin');
              }}
            >
              Back to sign in
            </button>
          </div>
          {resendNote && <p className="meta" style={{ marginTop: 12 }}>{resendNote}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="screen min-h-screen grid place-items-center px-7 py-10" style={GRADIENT_BG}>
      <div className="col center" style={{ gap: 15, width: '100%', maxWidth: 320, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="brand" style={{ fontSize: 38, marginBottom: 2 }}>
          Nenap<span className="dot">.</span>
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ink-2)', fontSize: 17, margin: '0 0 14px' }}>
          stay present, keep what matters
        </p>

        <button className="btn btn-soft btn-block btn-lg" type="button" disabled title="Google sign-in arrives once it's configured">
          <Icon name="google" size={19} /> Continue with Google
        </button>

        <div className="row" style={{ display: 'flex', width: '100%', gap: 12, alignItems: 'center', color: 'var(--ink-3)' }}>
          <hr className="hr" style={{ flex: 1 }} />
          <span className="meta">or</span>
          <hr className="hr" style={{ flex: 1 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 15 }}>
          <Input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={6} />
          {error && <p style={{ color: 'var(--rec)', fontSize: 13, margin: 0 }}>{error}</p>}
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
            {busy ? 'One moment…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p style={{ color: 'var(--ink-2)', fontSize: 13.5, margin: '4px 0 0' }}>
          {mode === 'signin' ? 'No account? ' : 'Already have one? '}
          <span
            style={{ color: 'var(--accent-deep)', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
          >
            {mode === 'signin' ? 'Create one' : 'Sign in'}
          </span>
        </p>

        {/* DEV-ONLY demo access — remove before production */}
        <button
          type="button"
          onClick={handleDemo}
          disabled={busy}
          className="meta"
          style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          ↳ continue to demo account (dev only)
        </button>
      </div>
    </main>
  );
}
