'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dashboard } from '@/components/dashboard';
import { LandingPage } from '@/components/landing-page';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { clearUrlParams, readAuthError } from '@/lib/auth-error';

export default function HomePage() {
  const { session, loading } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);

  // Supabase redirects expired/invalid email links here with ?error=… — surface it.
  useEffect(() => {
    const err = readAuthError();
    if (err) {
      setAuthError(err);
      clearUrlParams();
    }
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="eyebrow animate-pulse">Loading…</div>
      </main>
    );
  }

  // Auth error from a bad/expired link — show a calm message, route back to sign in.
  if (authError && !session) {
    return (
      <main
        className="min-h-screen grid place-items-center px-7 text-center"
        style={{ background: 'radial-gradient(900px 500px at 50% -10%, var(--rec-tint), transparent 60%), var(--bg)' }}
      >
        <div className="col center" style={{ maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <Brand className="text-[34px]" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: '12px 0 0' }}>
            That link didn’t work
          </h1>
          <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>{authError}</p>
          <Link href="/login" style={{ marginTop: 18 }}>
            <Button>Back to sign in</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <Dashboard email={session.user.email ?? undefined} />;
}
