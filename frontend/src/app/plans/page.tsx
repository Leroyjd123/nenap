'use client';

import Link from 'next/link';
import type { Plan } from '@nenap/types';
import { AuthGuard } from '@/components/auth-guard';
import { Brand } from '@/components/brand';
import { Footer } from '@/components/footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/components/ui/toast';
import { useEntitlements, useGrantPass, useSetPlan } from '@/lib/queries';
import { useDocumentTitle } from '@/hooks/use-document-title';

const TIERS: { plan: Plan; name: string; price: string; features: string[] }[] = [
  {
    plan: 'free',
    name: 'Free',
    price: '₹0',
    features: ['Unlimited notes, folders, tags & search', '1 voice recording / day', 'Up to 5-minute recordings', 'Photos on notes (small)'],
  },
  {
    plan: 'basic',
    name: 'Basic',
    price: '—',
    features: ['Everything in Free', '~10 recordings / day', 'Up to 30-minute recordings', '“Improve again” regeneration', 'File uploads · 2 GB storage'],
  },
  {
    plan: 'pro',
    name: 'Pro',
    price: '—',
    features: ['Everything in Basic', 'Unlimited recordings', 'Up to 60-minute recordings', '20 GB storage', 'Priority processing'],
  },
];

const BOOSTERS: { days: 1 | 3 | 5; label: string }[] = [
  { days: 1, label: '1 day' },
  { days: 3, label: '3 days' },
  { days: 5, label: '5 days' },
];

function Plans() {
  useDocumentTitle('Plans — Nenap');
  const toast = useToast();
  const ent = useEntitlements();
  const setPlan = useSetPlan();
  const grantPass = useGrantPass();

  const plan = ent.data?.plan ?? 'free';
  const tier = ent.data?.tier ?? 'free';
  const usage = ent.data?.usage.recordingsToday ?? 0;
  const cap = ent.data?.limits.recordingsPerDay ?? null;
  const pass = ent.data?.activePass ?? null;

  function choose(p: Plan) {
    setPlan.mutate(p, {
      onSuccess: () => toast.show(`Switched to ${p} (dev)`),
      onError: () => toast.show('Could not switch plan'),
    });
  }

  function boost(days: 1 | 3 | 5) {
    grantPass.mutate(days, {
      onSuccess: () => toast.show(`Booster active — Pro for ${days} day${days > 1 ? 's' : ''} (dev)`),
      onError: () => toast.show('Could not activate booster'),
    });
  }

  return (
    <main className="screen" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--pad)', borderBottom: '1px solid var(--line)' }}>
        <Link href="/" className="btn btn-ghost btn-sm" aria-label="Back to app"><Icon name="back" size={16} /> Back</Link>
        <Link href="/" aria-label="Nenap home"><Brand className="text-[20px]" /></Link>
        <ThemeToggle />
      </header>

      <div style={{ flex: 1, maxWidth: 980, margin: '0 auto', padding: '40px var(--pad) 64px', width: '100%' }}>
        <span className="eyebrow">Plans</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 34, letterSpacing: '-0.015em', margin: '6px 0 8px', lineHeight: 1.1 }}>
          Capture as much as you need
        </h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px', maxWidth: 560 }}>
          Notes are always free and unlimited. Plans and boosters unlock more voice recording and AI.
        </p>

        {/* Current status */}
        <div style={{ background: 'var(--accent-tint)', border: '1px solid var(--accent-line)', borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 28, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-deep)', textTransform: 'capitalize' }}>
            Current: {tier}{tier !== plan ? ` (plan: ${plan})` : ''}
          </span>
          <span className="meta">·</span>
          <span className="meta">
            Recordings today: {usage}{cap === null ? ' (unlimited)' : ` / ${cap}`}
          </span>
          {pass && (
            <>
              <span className="meta">·</span>
              <span className="meta">Booster active until {new Date(pass.expiresAt).toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Tiers */}
        <div className="lp-grid" style={{ marginBottom: 40 }}>
          {TIERS.map((t) => {
            const current = plan === t.plan;
            return (
              <div key={t.plan} className="feature-card" style={current ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent), var(--shadow-1)' } : undefined}>
                <div className="row between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ textTransform: 'capitalize' }}>{t.name}</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-2)' }}>{t.price}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 16px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {t.features.map((f) => (
                    <li key={f} style={{ display: 'flex', gap: 8, fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.4 }}>
                      <Icon name="check" size={15} style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="block"
                  variant={current ? 'soft' : 'primary'}
                  disabled={current}
                  loading={setPlan.isPending && setPlan.variables === t.plan}
                  onClick={() => choose(t.plan)}
                >
                  {current ? 'Current plan' : `Choose ${t.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Boosters */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, margin: '0 0 6px' }}>Booster packs</h2>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 16px', maxWidth: 540, lineHeight: 1.55 }}>
          Need a short burst — exam week, a conference? A booster gives you full <strong>Pro</strong> access for a few days, then reverts on its own.
        </p>
        <div className="lp-grid" style={{ marginBottom: 32 }}>
          {BOOSTERS.map((b) => (
            <div key={b.days} className="feature-card">
              <div className="fc-icon"><Icon name="spark" size={20} /></div>
              <h3>Pro for {b.label}</h3>
              <p>Unlimited recordings, file uploads, and Improve again for {b.label}.</p>
              <Button
                size="block"
                variant="soft"
                style={{ marginTop: 14 }}
                loading={grantPass.isPending && grantPass.variables === b.days}
                onClick={() => boost(b.days)}
              >
                Activate {b.label}
              </Button>
            </div>
          ))}
        </div>

        <p className="meta">
          Payments aren’t wired up yet — these buttons activate plans and boosters directly for testing. Real checkout is coming.
        </p>
      </div>

      <Footer />
    </main>
  );
}

export default function PlansPage() {
  return (
    <AuthGuard>
      <Plans />
    </AuthGuard>
  );
}
