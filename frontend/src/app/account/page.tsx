'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { Brand } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/components/ui/toast';
import { useSession } from '@/hooks/use-session';
import { useAccountStats, useDeleteAccount, useEntitlements } from '@/lib/queries';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { fmtBytes } from '@/lib/attachments';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '16px 18px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{value}</div>
      <div className="meta" style={{ marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Account() {
  useDocumentTitle('Account — Nenap');
  const router = useRouter();
  const toast = useToast();
  const { session } = useSession();
  const ent = useEntitlements();
  const stats = useAccountStats();
  const del = useDeleteAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const email = session?.user.email ?? '—';
  const tier = ent.data?.tier ?? 'free';
  const plan = ent.data?.plan ?? 'free';
  const pass = ent.data?.activePass ?? null;
  const s = stats.data;

  async function signOut() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace('/');
  }

  async function handleDelete() {
    try {
      await del.mutateAsync();
      await getSupabaseBrowserClient().auth.signOut();
      toast.show('Your account has been deleted');
      router.replace('/');
    } catch {
      toast.show('Could not delete the account — try again');
    }
  }

  return (
    <main className="screen" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--pad)', borderBottom: '1px solid var(--line)' }}>
        <Link href="/" className="btn btn-ghost btn-sm" aria-label="Back to app"><Icon name="back" size={16} /> Back</Link>
        <Link href="/" aria-label="Nenap home"><Brand className="text-[20px]" /></Link>
        <ThemeToggle />
      </header>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px var(--pad) 72px', width: '100%' }}>
        <span className="eyebrow">Account</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 34, letterSpacing: '-0.015em', margin: '6px 0 24px', lineHeight: 1.1 }}>
          Your space
        </h1>

        {/* Profile */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '18px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="av" style={{ width: 44, height: 44, fontSize: 18 }}>{(email[0] ?? 'N').toUpperCase()}</span>
          <div className="grow" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{email}</div>
            <div className="meta">Signed in with email</div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>Sign out</Button>
        </div>

        {/* Plan */}
        <div style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r)', padding: '16px 20px', marginBottom: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <div className="grow" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-deep)', textTransform: 'capitalize' }}>
              {tier} plan{tier !== plan ? ` · booster active` : ''}
            </div>
            {pass && <div className="meta" style={{ marginTop: 2 }}>Booster until {new Date(pass.expiresAt).toLocaleString()}</div>}
          </div>
          <Link href="/plans" className="btn btn-primary btn-sm"><Icon name="spark" size={15} /> Manage plan</Link>
        </div>

        {/* Usage metrics */}
        <span className="eyebrow">Your activity</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, margin: '12px 0 32px' }}>
          {stats.isLoading || !s ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ height: 86, background: 'var(--surface-2)', borderRadius: 'var(--r)' }} />
            ))
          ) : (
            <>
              <Stat label="Notes" value={s.notes} />
              <Stat label="Recordings" value={s.recordings} />
              <Stat label="Transcripts" value={s.transcripts} />
              <Stat label="AI enhancements" value={s.enhancedVersions} />
              <Stat label="Attachments" value={s.attachments} />
              <Stat label="Folders" value={s.folders} />
              <Stat label="Tags" value={s.tags} />
              <Stat label="Storage used" value={fmtBytes(s.storageBytes)} />
            </>
          )}
        </div>

        {/* Danger zone */}
        <span className="eyebrow" style={{ color: 'var(--rec)' }}>Danger zone</span>
        <div style={{ background: 'var(--rec-tint)', border: '1px solid var(--rec-line)', borderRadius: 'var(--r)', padding: '16px 20px', marginTop: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <div className="grow" style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5 }}>Delete account</div>
            <div className="meta" style={{ marginTop: 2 }}>Permanently removes your notes, recordings, transcripts, and files. This can’t be undone.</div>
          </div>
          <Button variant="ghost" size="sm" style={{ color: 'var(--rec)' }} onClick={() => setConfirmDelete(true)}>
            <Icon name="trash" size={15} /> Delete account
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete your account?"
        body="Everything — notes, recordings, transcripts, files — is permanently deleted. This can’t be undone."
        confirmLabel="Delete everything"
        destructive
        busy={del.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </main>
  );
}

export default function AccountPage() {
  return (
    <AuthGuard>
      <Account />
    </AuthGuard>
  );
}
