import Link from 'next/link';
import { Brand } from '@/components/brand';
import { Footer } from '@/components/footer';
import { Icon } from '@/components/ui/icon';

/**
 * Shared, in-brand wrapper for the static legal pages (privacy, terms).
 * Editorial prose on the calm background, with a back link and the site footer.
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
    <main className="screen" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header
        className="row between"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px var(--pad)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <Link href="/" className="btn btn-ghost btn-sm" aria-label="Back to home">
          <Icon name="back" size={16} /> Back
        </Link>
        <Link href="/" aria-label="Nenap home">
          <Brand className="text-[20px]" />
        </Link>
        <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
      </header>

      <article
        className="prose-nenap"
        style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '40px var(--pad) 72px', width: '100%' }}
      >
        <Link href="/" className="footer-link" style={{ fontSize: 13 }}>← Back to home</Link>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 34,
            letterSpacing: '-0.015em',
            margin: '14px 0 6px',
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
          <Link href="/privacy" style={{ color: 'var(--accent-deep)' }}>Privacy</Link>
          {' · '}
          <Link href="/terms" style={{ color: 'var(--accent-deep)' }}>Terms</Link>
          {' · '}
          <Link href="/" style={{ color: 'var(--accent-deep)' }}>Home</Link>
        </p>
      </article>

      <Footer />
    </main>
  );
}
