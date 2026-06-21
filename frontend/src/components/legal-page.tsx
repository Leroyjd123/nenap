import Link from 'next/link';
import { Brand } from '@/components/brand';

/**
 * Shared, in-brand wrapper for the static legal pages (privacy, terms).
 * Editorial prose on the calm background; links back to the app.
 */
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="screen" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header
        className="row between"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px var(--pad)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <Link href="/" aria-label="Nenap home">
          <Brand className="text-[20px]" />
        </Link>
        <Link href="/login" className="btn btn-ghost btn-sm">
          Sign in
        </Link>
      </header>

      <article
        className="prose-nenap"
        style={{ maxWidth: 680, margin: '0 auto', padding: '40px var(--pad) 80px' }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: '-0.015em',
            margin: '0 0 6px',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        <p className="meta" style={{ marginBottom: 28 }}>
          Last updated {updated}
        </p>
        {children}
        <hr className="hr" style={{ margin: '40px 0 20px' }} />
        <p className="meta">
          Questions? Email{' '}
          <a href="mailto:privacy@nenap.app" style={{ color: 'var(--accent-deep)' }}>
            privacy@nenap.app
          </a>
          . · <Link href="/privacy" style={{ color: 'var(--accent-deep)' }}>Privacy</Link> ·{' '}
          <Link href="/terms" style={{ color: 'var(--accent-deep)' }}>Terms</Link>
        </p>
      </article>
    </main>
  );
}
