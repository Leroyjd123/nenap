import type { Metadata } from 'next';
import Link from 'next/link';
import { Brand } from '@/components/brand';
import { Footer } from '@/components/footer';
import { ThemeToggle } from '@/components/theme-toggle';
import { Icon } from '@/components/ui/icon';

export const metadata: Metadata = {
  title: 'Help Center — Nenap',
  description: 'How to use Nenap, plus links to our policies.',
};

const STEPS = [
  {
    icon: 'doc' as const,
    title: 'Write a note',
    body: 'Tap “New note”, give it a title, and write naturally. Save tucks it into a folder and adds tags — or just save as-is.',
  },
  {
    icon: 'mic' as const,
    title: 'Record alongside',
    body: 'Tap “Record” and speak. You’ll see a live transcript. Use Pause/Resume any time, then Save — Nenap transcribes and improves it in the background. You can record several notes in one session.',
  },
  {
    icon: 'spark' as const,
    title: 'Let Nenap help (optional)',
    body: 'On the Save dialog, tick “Let Nenap suggest a folder & tags” to have the AI organise the note for you. Your original words are always kept — the enhanced version is separate.',
  },
  {
    icon: 'search' as const,
    title: 'Find anything',
    body: 'Search from the dashboard across titles, tags, transcripts, and enhanced notes. Filter by folder or “with recording”.',
  },
];

const FAQ = [
  { q: 'Does recording replace my note?', a: 'No. Your original note is never overwritten. The transcript and the AI-enhanced version live in separate tabs.' },
  { q: 'What happens after I save a recording?', a: 'Processing runs in the background. The note shows “improving…” and becomes ready on its own — you don’t have to wait on a loading screen.' },
  { q: 'Which browsers support the live transcript?', a: 'Live transcript works best in Chrome and Edge. Even where it isn’t supported, the audio still saves and is transcribed afterwards.' },
];

export default function HelpPage() {
  return (
    <main className="screen" style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header
        className="row between"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px var(--pad)', borderBottom: '1px solid var(--line)' }}
      >
        <Link href="/home" className="btn btn-ghost btn-sm" aria-label="Back to app">
          <Icon name="back" size={16} /> Back
        </Link>
        <Link href="/home" aria-label="Nenap home"><Brand className="text-[20px]" /></Link>
        <ThemeToggle />
      </header>

      <div style={{ flex: 1, maxWidth: 760, margin: '0 auto', padding: '40px var(--pad) 72px', width: '100%' }}>
        <span className="eyebrow">Help Center</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 34, letterSpacing: '-0.015em', margin: '6px 0 8px', lineHeight: 1.1 }}>
          How Nenap works
        </h1>
        <p style={{ color: 'var(--ink-2)', fontSize: 15, lineHeight: 1.6, margin: '0 0 28px', maxWidth: 560 }}>
          Notes are primary, recording is supportive, and the AI stays quietly in the background. Here’s the short version.
        </p>

        <div className="lp-grid" style={{ marginBottom: 40 }}>
          {STEPS.map((s) => (
            <div key={s.title} className="feature-card">
              <div className="fc-icon"><Icon name={s.icon} size={20} /></div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, margin: '0 0 14px' }}>Common questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
          {FAQ.map((f) => (
            <div key={f.q} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r)', padding: '16px 18px' }}>
              <p style={{ fontWeight: 600, fontSize: 14.5, margin: '0 0 4px', color: 'var(--ink)' }}>{f.q}</p>
              <p style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.55, margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 24, margin: '0 0 14px' }}>Policies &amp; contact</h2>
        <div className="row wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link href="/privacy" className="btn btn-soft btn-sm"><Icon name="doc" size={15} /> Privacy Policy</Link>
          <Link href="/terms" className="btn btn-soft btn-sm"><Icon name="doc" size={15} /> Terms of Service</Link>
          <a href="mailto:hello@nenap.app" className="btn btn-ghost btn-sm">Email support</a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
