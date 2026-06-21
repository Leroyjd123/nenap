import Link from 'next/link';
import { Brand } from '@/components/brand';

/** Shared site footer for the landing and legal pages. */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div style={{ maxWidth: 280 }}>
          <Brand className="text-[22px]" />
          <p style={{ color: 'var(--ink-2)', fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>
            Focus on the moment. Nenap remembers the rest.
          </p>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          <div className="footer-col">
            <span className="eyebrow">Product</span>
            <Link href="/login" className="footer-link">Sign in</Link>
            <Link href="/login" className="footer-link">Get started</Link>
          </div>
          <div className="footer-col">
            <span className="eyebrow">Legal</span>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
          </div>
          <div className="footer-col">
            <span className="eyebrow">Support</span>
            <Link href="/help" className="footer-link">Help Center</Link>
            <a href="mailto:hello@nenap.app" className="footer-link">hello@nenap.app</a>
          </div>
        </nav>
      </div>
      <div className="footer-bottom">
        <span className="meta">© 2026 Nenap. All rights reserved.</span>
      </div>
    </footer>
  );
}
