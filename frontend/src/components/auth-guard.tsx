'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/hooks/use-session';

function LoadingSplash() {
  return <main className="min-h-screen grid place-items-center eyebrow animate-pulse">Loading…</main>;
}

/**
 * Gates a page to authenticated users. While the session resolves we show a calm
 * splash; if there's no session we send the visitor to the homepage (which offers
 * sign-in). Children — and any data fetching inside them — only mount once authed.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && !session) router.replace('/');
  }, [loading, session, router]);

  if (loading || !session) return <LoadingSplash />;
  return <>{children}</>;
}
