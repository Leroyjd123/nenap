'use client';

import Link from 'next/link';
import type { Folder, NoteSummary } from '@nenap/types';
import { Icon } from '@/components/ui/icon';

const dateFmt = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' });

/** Compact one-line row for the dashboard's list/table view. */
export function NoteRow({ note, folders }: { note: NoteSummary; folders?: Folder[] }) {
  const when = dateFmt.format(new Date(note.updatedAt));
  const folderName = folders?.find((f) => f.id === note.folderId)?.name;
  const processing = note.status === 'processing';

  const inner = (
    <>
      {note.hasRecording && <Icon name="wave" size={14} style={{ color: 'var(--rec)', flex: 'none' }} />}
      <span className="nr-title truncate" style={{ flex: '0 1 auto', maxWidth: '40%' }}>{note.title || 'Untitled'}</span>
      <span className="nr-ex truncate grow" style={{ flex: 1, minWidth: 0 }}>{note.excerpt}</span>
      {processing ? (
        <span className="tag" style={{ color: 'var(--accent-deep)', background: 'var(--accent-tint)', flex: 'none' }}>improving…</span>
      ) : (
        note.tags.slice(0, 2).map((t) => <span key={t.id} className="tag" style={{ flex: 'none' }}>{t.name}</span>)
      )}
      {folderName && <span className="meta" style={{ flex: 'none' }}>{folderName}</span>}
      <span className="meta" style={{ flex: 'none', width: 52, textAlign: 'right' }}>{when}</span>
    </>
  );

  if (processing) {
    return (
      <div className="note-row" aria-disabled="true" title="Improving your note — available once it’s ready" style={{ opacity: 0.6, cursor: 'progress' }}>
        {inner}
      </div>
    );
  }
  return (
    <Link href={`/notes/${note.id}`} className="note-row">
      {inner}
    </Link>
  );
}
