'use client';

import Link from 'next/link';
import { Dashboard } from '@/components/dashboard';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';

export default function HomePage() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center">
        <div className="eyebrow animate-pulse">Loading…</div>
      </main>
    );
  }

  // Not signed in → calm prompt to the auth screen (no onboarding wall).
  if (!session) {
    return (
      <main className="min-h-screen grid place-items-center px-5 text-center">
        <div className="max-w-[420px] flex flex-col items-center gap-5">
          <Brand className="text-[40px]" />
          <p className="font-display text-[22px] text-ink m-0">
            A notebook that remembers alongside you.
          </p>
          <p className="text-ink-2 text-sm m-0 leading-relaxed">
            The space is yours when you&apos;re ready.
          </p>
          <Link href="/login">
            <Button size="lg">Get started</Button>
          </Link>
        </div>
      </main>
    );
  }

  return <Dashboard email={session.user.email ?? undefined} />;
}
