'use client';

import Link from 'next/link';
import type { Folder, NoteSummary } from '@nenap/types';
import { Icon } from '@/components/ui/icon';

const dateFmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

/** Dashboard note card (.note-card): serif title, 2-line excerpt, mono footer, clay rec dot. */
export function NoteCard({ note, folders }: { note: NoteSummary; folders?: Folder[] }) {
  const when = dateFmt.format(new Date(note.updatedAt));
  const folderName = folders?.find((f) => f.id === note.folderId)?.name;
  const processing = note.status === 'processing';

  const inner = (
    <>
      {note.hasRecording && (
        <span className="rec-dot" style={{ position: 'absolute', top: 'var(--pad)', right: 'var(--pad)' }} />
      )}
      <h3 className="nc-title" style={{ paddingRight: note.hasRecording ? 16 : 0 }}>
        {note.title || 'Untitled'}
      </h3>
      {note.excerpt && <p className="nc-ex">{note.excerpt}</p>}
      <div className="nc-foot">
        <span className="meta">{when}</span>
        {processing ? (
          <span className="tag" style={{ color: 'var(--accent-deep)', background: 'var(--accent-tint)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <Icon name="spark" size={11} className="animate-pulse" /> improving…
          </span>
        ) : (
          note.tags.slice(0, 2).map((t) => <span key={t.id} className="tag">{t.name}</span>)
        )}
        <span className="grow" style={{ flex: 1 }} />
        {folderName && <span className="meta">{folderName}</span>}
      </div>
    </>
  );

  // While processing, the note isn't ready — show it disabled rather than openable.
  if (processing) {
    return (
      <div
        className="note-card"
        aria-disabled="true"
        title="Improving your note — available once it’s ready"
        style={{ opacity: 0.6, cursor: 'progress', pointerEvents: 'none' }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link href={`/notes/${note.id}`} className="note-card">
      {inner}
    </Link>
  );
}
