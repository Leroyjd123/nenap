'use client';

import Link from 'next/link';
import type { NoteSummary } from '@nenap/types';
import { Tag } from '@/components/ui/tag';

const dateFmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

/** Dashboard note card (.note-card): serif title, 2-line excerpt, mono footer, clay rec dot. */
export function NoteCard({ note }: { note: NoteSummary }) {
  const when = dateFmt.format(new Date(note.updatedAt));

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group relative block bg-surface border border-line rounded-[var(--r)]
                 p-[var(--pad)] shadow-1 overflow-hidden transition-all duration-200
                 hover:border-accent-line hover:shadow-2 hover:-translate-y-0.5"
    >
      {note.hasRecording && (
        <span
          className="absolute top-4 right-4 w-2 h-2 rounded-full"
          style={{ background: 'var(--rec)', boxShadow: '0 0 0 3px var(--rec-tint)' }}
          aria-label="Has recording"
        />
      )}

      <h3 className="font-display text-[18px] font-semibold leading-tight tracking-[-0.01em] m-0 pr-6">
        {note.title || 'Untitled'}
      </h3>

      {note.excerpt && (
        <p className="text-ink-2 text-[13.5px] leading-relaxed mt-2 line-clamp-2">{note.excerpt}</p>
      )}

      <div className="flex items-center gap-2 mt-3.5 flex-wrap">
        <span className="font-mono text-[11px] text-ink-3">{when}</span>
        {note.status === 'processing' && (
          <span className="font-mono text-[10.5px] text-accent-deep">· improving…</span>
        )}
        {note.tags.slice(0, 3).map((t) => (
          <Tag key={t.id} label={t.name} />
        ))}
      </div>
    </Link>
  );
}
