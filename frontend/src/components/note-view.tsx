'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Note } from '@nenap/types';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Icon } from '@/components/ui/icon';
import { Segmented } from '@/components/ui/segmented';
import { Tag } from '@/components/ui/tag';
import { useToast } from '@/components/ui/toast';
import { EnhancingOverlay } from '@/components/enhancing-overlay';
import { SaveNoteModal } from '@/components/editor/save-note-modal';
import {
  useDeleteNote,
  useFolders,
  useImproveNote,
  useNote,
  useRecordingUrl,
  useUpdateNote,
} from '@/lib/queries';
import { fmtDuration } from '@/lib/recordings';

type TabKey = 'enhanced' | 'original' | 'transcript';

const dateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

/** Read-only Note View with Enhanced/Original/Transcript tabs, playback, and Improve again. */
export function NoteView({ note: initial }: { note: Note }) {
  const router = useRouter();
  const toast = useToast();
  const folders = useFolders();
  // Re-fetch (and poll while processing) so the enhanced note appears when ready.
  const live = useNote(initial.id, { poll: true });
  const note = live.data ?? initial;

  const updateNote = useUpdateNote(note.id);
  const deleteNote = useDeleteNote();
  const improve = useImproveNote(note.id);
  const playback = useRecordingUrl(note.id, note.hasRecording);

  const latestEnhanced = note.enhancedVersions[0]?.content ?? null;
  const [tab, setTab] = useState<TabKey>(
    initial.enhancedVersions.length > 0 || initial.status === 'processing' ? 'enhanced' : 'original',
  );
  const [organise, setOrganise] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const processing = note.status === 'processing';
  const failed = note.status === 'failed';

  async function handleOrganise({ folderId, tagNames }: { folderId: string | null; tagNames: string[] }) {
    try {
      await updateNote.mutateAsync({ folderId, tagNames });
      toast.show('Note updated');
      setOrganise(false);
    } catch {
      toast.show('Could not update');
    }
  }

  async function handleDelete() {
    await deleteNote.mutateAsync(note.id);
    toast.show('Note deleted');
    router.push('/');
  }

  function handleImprove() {
    improve.mutate(undefined, {
      onSuccess: () => toast.show('Improving your note…'),
      onError: () => toast.show('Could not start — try again'),
    });
  }

  const folderName = folders.data?.find((f) => f.id === note.folderId)?.name;

  return (
    <div className="screen col" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {processing && <EnhancingOverlay />}

      <header className="d-top">
        <button onClick={() => router.push('/')} className="btn btn-ghost btn-sm" type="button">
          <Icon name="back" size={17} /> Notes
        </button>
        <Brand className="text-[18px] hidden md:block" />
        <span className="grow" style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" onClick={() => setOrganise(true)}>
          <Icon name="move" size={15} /> Organise
        </Button>
        <Button variant="soft" size="sm" onClick={() => router.push(`/notes/${note.id}/edit`)}>
          <Icon name="edit" size={15} /> Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} style={{ color: 'var(--rec)' }}>
          <Icon name="trash" size={15} /> Delete
        </Button>
      </header>

      <div className="scrollable" style={{ flex: 1, overflowY: 'auto', padding: '8px 0 50px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '12px var(--pad)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.015em', fontSize: 30, margin: '8px 0', lineHeight: 1.12 }}>
            {note.title || 'Untitled'}
          </h1>
          <div className="row wrap" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {note.tags.map((t) => <Tag key={t.id} label={t.name} />)}
            <span className="meta">
              · {folderName ? `${folderName} · ` : ''}edited {dateFmt.format(new Date(note.updatedAt))}
            </span>
            {note.recording?.durationSec != null && (
              <span className="nc-rec"><Icon name="wave" size={13} /> {fmtDuration(note.recording.durationSec)}</span>
            )}
          </div>

          {failed && (
            <div style={{ marginTop: 16, background: 'var(--rec-tint)', border: '1px solid var(--rec-line)', borderRadius: 'var(--r-sm)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--rec)', fontSize: 13.5, flex: 1 }}>Processing didn’t finish.</span>
              <Button variant="soft" size="sm" onClick={handleImprove} loading={improve.isPending}>Retry</Button>
            </div>
          )}

          <div className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
            <Segmented
              value={tab}
              onChange={setTab}
              options={[
                { value: 'enhanced', label: 'Enhanced' },
                { value: 'original', label: 'Original' },
                { value: 'transcript', label: 'Transcript' },
              ]}
            />
            {tab === 'enhanced' && latestEnhanced && (
              <Button size="sm" onClick={handleImprove} loading={improve.isPending} disabled={processing}>
                <Icon name="spark" size={16} /> Improve again
              </Button>
            )}
          </div>

          <hr className="hr" style={{ margin: '20px 0 22px' }} />

          {tab === 'enhanced' &&
            (latestEnhanced ? (
              <div className="prose-nenap reveal" dangerouslySetInnerHTML={{ __html: latestEnhanced }} />
            ) : (
              <TabEmpty
                title={processing ? 'Improving your note…' : 'No enhanced version yet'}
                hint={processing ? 'This appears the moment it’s ready.' : 'Record alongside a note, or tap Improve, and a cleaner version lands here.'}
              />
            ))}

          {tab === 'original' && (
            <div className="prose-nenap" dangerouslySetInnerHTML={{ __html: note.originalContent || '<p>This note is empty.</p>' }} />
          )}

          {tab === 'transcript' && (
            <div>
              {note.hasRecording && playback.data?.url && (
                <audio controls src={playback.data.url} style={{ width: '100%', marginBottom: 16 }} />
              )}
              {note.transcript ? (
                <div className="prose-nenap font-mono" style={{ fontSize: 13.5 }}>
                  <span className="eyebrow">Full transcript</span>
                  <p style={{ marginTop: 10 }}>{note.transcript.content}</p>
                </div>
              ) : (
                <TabEmpty
                  title={processing ? 'Transcribing…' : 'No transcript yet'}
                  hint={processing ? 'Gemini is listening back through your recording.' : 'Transcripts appear here once you record audio with a note.'}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <SaveNoteModal
        open={organise}
        onClose={() => setOrganise(false)}
        folders={folders.data ?? []}
        initialFolderId={note.folderId}
        initialTags={note.tags.map((t) => t.name)}
        title="Organise note"
        subtitle="Move it to a folder and edit its tags."
        saving={updateNote.isPending}
        onConfirm={handleOrganise}
      />

      <ConfirmModal
        open={confirmDelete}
        title="Delete this note?"
        body="The note, its transcript, and any recording will be removed. This can’t be undone."
        confirmLabel="Delete note"
        destructive
        busy={deleteNote.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function TabEmpty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="border border-dashed border-line-2 rounded-[var(--r)] p-8 text-center">
      <p className="font-display text-[17px] text-ink m-0">{title}</p>
      <p className="text-ink-2 text-sm mt-1.5 m-0 leading-relaxed">{hint}</p>
    </div>
  );
}
