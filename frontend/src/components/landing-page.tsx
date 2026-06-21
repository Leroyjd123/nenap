'use client';

import Link from 'next/link';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/footer';
import { Icon } from '@/components/ui/icon';
import { useDocumentTitle } from '@/hooks/use-document-title';

const FEATURES = [
  {
    icon: 'doc' as const,
    title: 'Write naturally',
    body: 'Capture thoughts as plain, calm notes. Organise gently with folders and tags — never forced.',
  },
  {
    icon: 'mic' as const,
    title: 'Record alongside',
    body: 'Speak while you think. Nenap captures the audio with a live transcript, so nothing slips away.',
  },
  {
    icon: 'spark' as const,
    title: 'A cleaner note, gently',
    body: 'Nenap hands back a structured version of your note — always preserving your original words.',
  },
  {
    icon: 'folder' as const,
    title: 'Calm by design',
    body: 'No noise, no chatbot persona. Just a quiet space that remembers the moment alongside you.',
  },
];

const STEPS = [
  { n: 1, title: 'Capture', body: 'Start a note or hit record — whichever fits the moment.' },
  { n: 2, title: 'Keep going', body: 'Type and talk freely. Your original is never overwritten.' },
  { n: 3, title: 'Nenap remembers', body: 'A transcript and a cleaner note appear when you save.' },
];

/** Public marketing homepage for signed-out visitors. */
export function LandingPage() {
  useDocumentTitle('Nenap — Focus on the moment');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <header className="lp-nav">
        <Brand className="text-[22px]" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" className="btn btn-ghost btn-sm">Sign in</Link>
          <Link href="/login" className="btn btn-primary btn-sm">Get started</Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section
          className="lp-wrap lp-hero"
          style={{ background: 'radial-gradient(900px 460px at 50% -20%, var(--accent-tint), transparent 60%)' }}
        >
          <span className="eyebrow">A calm knowledge-capture app</span>
          <h1>A notebook that remembers alongside you.</h1>
          <p className="lead">Focus on the moment. Nenap remembers the rest.</p>
          <p className="lp-sub">
            Write notes naturally. Optionally record alongside them. Nenap quietly hands back a cleaner
            note — while always preserving your original words.
          </p>
          <div className="lp-cta">
            <Link href="/login"><Button size="lg">Get started — it’s free</Button></Link>
            <Link href="/login"><Button size="lg" variant="soft">Sign in</Button></Link>
          </div>
        </section>

        {/* Features */}
        <section className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <span className="eyebrow">What it does</span>
              <h2>Everything you capture, kept gently</h2>
              <p>Notes are primary, recording is supportive, and the AI stays invisible.</p>
            </div>
            <div className="lp-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="feature-card">
                  <div className="fc-icon"><Icon name={f.icon} size={20} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Purpose / how it works */}
        <section className="lp-section">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <span className="eyebrow">Why Nenap</span>
              <h2>Made for staying present</h2>
              <p>
                Meetings, lectures, sudden ideas — capturing them shouldn’t pull you out of the moment.
                Nenap does the remembering so you can keep listening and thinking.
              </p>
            </div>
            <div className="lp-steps">
              {STEPS.map((s) => (
                <div key={s.n} className="lp-step">
                  <div className="num">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="lp-section" style={{ textAlign: 'center' }}>
          <div className="lp-wrap">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(24px, 4vw, 32px)', margin: 0 }}>
              The space is yours when you’re ready.
            </h2>
            <div className="lp-cta">
              <Link href="/login"><Button size="lg">Create your account</Button></Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
