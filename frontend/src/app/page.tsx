'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { ConnectionStatus } from '@/components/connection-status';
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

  const email = session.user.email ?? undefined;

  return (
    <AppShell email={email}>
      <div className="max-w-[760px] flex flex-col gap-5">
        <section className="bg-surface border border-line rounded-[var(--r)] shadow-1 p-[var(--pad)]">
          <p className="eyebrow m-0 mb-2">Phase 1 · Foundation</p>
          <h2 className="font-display text-[24px] font-semibold text-ink m-0">
            The foundation is in place.
          </h2>
          <p className="text-ink-2 text-sm mt-2 leading-relaxed m-0">
            Authentication, the design system, and the backend handshake are wired. Notes, folders,
            and the editor arrive in Phase 2.
          </p>
        </section>

        <ConnectionStatus />
      </div>
    </AppShell>
  );
}
