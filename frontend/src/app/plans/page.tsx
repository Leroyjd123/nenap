'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { CheckoutSku, Plan } from '@nenap/types';
import { AuthGuard } from '@/components/auth-guard';
import { Brand } from '@/components/brand';
import { Footer } from '@/components/footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useEntitlements } from '@/lib/queries';
import { useCheckout } from '@/hooks/use-checkout';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { capture } from '@/lib/analytics';

const TIERS: { plan: Plan; name: string; price: string; per?: string; sku?: CheckoutSku; features: string[] }[] = [
  {
    plan: 'free',
    name: 'Free',
    price: '₹0',
    features: ['Unlimited notes, folders, tags & search', '1 voice recording / day', 'Up to 5-minute recordings', 'Photos on notes (small)'],
  },
  {
    plan: 'pro',
    name: 'Pro',
    price: '₹149',
    per: '30 days',
    sku: 'pro_30d',
    features: ['Everything in Free', '~10 recordings / day', 'Up to 30-minute recordings', '“Improve again” regeneration', 'File uploads · 2 GB storage'],
  },
  {
    plan: 'enterprise',
    name: 'Enterprise',
    price: '₹399',
    per: '30 days',
    sku: 'enterprise_30d',
    features: ['Everything in Pro', 'Unlimited recordings', 'Up to 60-minute recordings', '20 GB storage', 'Priority processing'],
  },
];

// Boosters grant a short full-Enterprise burst, then revert on their own.
const BOOSTERS: { label: string; price: string; sku: CheckoutSku }[] = [
  { label: '1 day', price: '₹29', sku: 'booster_1d' },
  { label: '3 days', price: '₹69', sku: 'booster_3d' },
  { label: '5 days', price: '₹99', sku: 'booster_5d' },
];

function Plans() {
  useDocumentTitle('Plans — Nenap');
  useEffect(() => { capture('plan_viewed'); }, []);
  const ent = useEntitlements();
  const { checkout, pendingSku } = useCheckout();

  const tier = ent.data?.tier ?? 'free';
  const usage = ent.data?.usage.recordingsToday ?? 0;
  const cap = ent.data?.limits.recordingsPerDay ?? null;
  const pass = ent.data?.activePass ?? null;

  return (
    <main className="screen" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--pad)', borderBottom: '1px solid var(--line)' }}>
        <Link href="/home" className="btn btn-ghost btn-sm" aria-label="Back to app"><Icon name="back" size={16} /> Back</Link>
        <Link href="/home" aria-label="Nenap home"><Brand className="text-[20px]" /></Link>
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
            Current: {tier}
          </span>
          {pass && (
            <>
              <span className="meta">·</span>
              <span className="meta">
                {pass.level} until {new Date(pass.expiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </>
          )}
          <span className="meta">·</span>
          <span className="meta">
            Recordings today: {usage}{cap === null ? ' (unlimited)' : ` / ${cap}`}
          </span>
        </div>

        {/* Tiers */}
        <div className="lp-grid" style={{ marginBottom: 40 }}>
          {TIERS.map((t) => {
            const current = tier === t.plan;
            return (
              <div key={t.plan} className="feature-card" style={current ? { borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent), var(--shadow-1)' } : undefined}>
                <div className="row between" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ textTransform: 'capitalize' }}>{t.name}</h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-2)' }}>
                    {t.price}{t.per ? <span style={{ fontSize: 11, color: 'var(--ink-3)' }}> / {t.per}</span> : ''}
                  </span>
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
                  disabled={current || !t.sku}
                  loading={!!t.sku && pendingSku === t.sku}
                  onClick={() => t.sku && checkout(t.sku)}
                >
                  {current ? 'Current plan' : t.sku ? `Get ${t.name} · ${t.price}` : 'Free forever'}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Boosters */}
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, margin: '0 0 6px' }}>Booster packs</h2>
        <p style={{ color: 'var(--ink-2)', fontSize: 14, margin: '0 0 16px', maxWidth: 540, lineHeight: 1.55 }}>
          Need a short burst — exam week, a conference? A booster gives you full <strong>Enterprise</strong> access for a few days, then reverts on its own.
        </p>
        <div className="lp-grid" style={{ marginBottom: 32 }}>
          {BOOSTERS.map((b) => (
            <div key={b.sku} className="feature-card">
              <div className="fc-icon"><Icon name="spark" size={20} /></div>
              <h3>Enterprise for {b.label}</h3>
              <p>Unlimited recordings, file uploads, and Improve again for {b.label}.</p>
              <Button
                size="block"
                variant="soft"
                style={{ marginTop: 14 }}
                loading={pendingSku === b.sku}
                onClick={() => checkout(b.sku)}
              >
                Get Enterprise for {b.label} · {b.price}
              </Button>
            </div>
          ))}
        </div>

        <p className="meta">
          Secure payments by Razorpay. Currently in <strong>test mode</strong> — use a Razorpay test card (e.g. 4111&nbsp;1111&nbsp;1111&nbsp;1111, any future expiry/CVV); no real charge is made.
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
