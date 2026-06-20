'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Note } from '@nenap/types';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Segmented } from '@/components/ui/segmented';
import { Tag } from '@/components/ui/tag';
import { useToast } from '@/components/ui/toast';
import { SaveNoteModal } from '@/components/editor/save-note-modal';
import { useDeleteNote, useFolders, useUpdateNote } from '@/lib/queries';

type TabKey = 'enhanced' | 'original' | 'transcript';

const dateFmt = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

/**
 * Read-only Note View — the screen you land on when opening a note. Enhanced/Original/
 * Transcript tabs (Enhanced + Transcript fill in once recording/AI land in Phases 3–4).
 * Editing is a deliberate action, never the default.
 */
export function NoteView({ note }: { note: Note }) {
  const router = useRouter();
  const toast = useToast();
  const folders = useFolders();
  const updateNote = useUpdateNote(note.id);
  const deleteNote = useDeleteNote();

  const latestEnhanced = note.enhancedVersions[0]?.content ?? null;
  const [tab, setTab] = useState<TabKey>(latestEnhanced ? 'enhanced' : 'original');
  const [organise, setOrganise] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const folderName = folders.data?.find((f) => f.id === note.folderId)?.name;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-3 px-[var(--pad)] py-3.5 border-b border-line">
        <button onClick={() => router.push('/')} className="text-ink-2 hover:text-ink text-sm" type="button">
          ← Notes
        </button>
        <Brand className="text-[18px] hidden md:block" />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOrganise(true)}>
            Organise
          </Button>
          <Button variant="soft" size="sm" onClick={() => router.push(`/notes/${note.id}/edit`)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[720px] mx-auto px-[var(--pad)] py-8">
        <h1 className="font-display text-[30px] font-semibold tracking-[-0.01em] text-ink m-0">
          {note.title || 'Untitled'}
        </h1>

        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className="meta">{dateFmt.format(new Date(note.updatedAt))}</span>
          {folderName && <span className="meta">· {folderName}</span>}
          {note.tags.map((t) => (
            <Tag key={t.id} label={t.name} />
          ))}
        </div>

        <div className="mt-6 mb-5">
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'enhanced', label: 'Enhanced' },
              { value: 'original', label: 'Original' },
              { value: 'transcript', label: 'Transcript' },
            ]}
          />
        </div>

        {tab === 'original' && <Prose html={note.originalContent} emptyHint="This note is empty." />}

        {tab === 'enhanced' &&
          (latestEnhanced ? (
            <Prose html={latestEnhanced} />
          ) : (
            <TabEmpty
              title="No enhanced version yet"
              hint="Record alongside a note and Nenap will gently improve it. Coming in a later step."
            />
          ))}

        {tab === 'transcript' &&
          (note.transcript ? (
            <Prose html={`<p>${note.transcript.content}</p>`} mono />
          ) : (
            <TabEmpty
              title="No transcript yet"
              hint="Transcripts appear here once you record audio with a note."
            />
          ))}
      </div>

      <SaveNoteModal
        open={organise}
        onClose={() => setOrganise(false)}
        folders={folders.data ?? []}
        initialFolderId={note.folderId}
        initialTags={note.tags.map((t) => t.name)}
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

function Prose({ html, mono, emptyHint }: { html: string; mono?: boolean; emptyHint?: string }) {
  const isEmpty = !html || html.replace(/<[^>]*>/g, '').trim() === '';
  if (isEmpty && emptyHint) {
    return <p className="text-ink-3 text-sm">{emptyHint}</p>;
  }
  return (
    <div
      className={`prose-nenap ${mono ? 'font-mono text-[13.5px]' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
