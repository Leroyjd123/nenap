'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Note } from '@nenap/types';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { TiptapEditor } from './tiptap-editor';
import { SaveNoteModal } from './save-note-modal';
import { RecordingRail } from './recording-rail';
import { useCreateNote, useFolders, useUpdateNote } from '@/lib/queries';

/**
 * Editor for new and existing notes. Capture-first: write straight away, organise at
 * save. Recording attaches to the note (a draft is created on first record if needed).
 */
export function NoteEditor({ note }: { note?: Note }) {
  const router = useRouter();
  const toast = useToast();
  const folders = useFolders();
  const createNote = useCreateNote();
  const [createdId, setCreatedId] = useState<string | null>(null);
  const effectiveId = note?.id ?? createdId;
  const updateNote = useUpdateNote(effectiveId ?? '');

  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.originalContent ?? '');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.originalContent);
    }
  }, [note]);

  const saving = createNote.isPending || updateNote.isPending;
  const plainBody = content.replace(/<[^>]*>/g, '').trim();
  const isEmpty = !title.trim() && !plainBody;

  /** Used by both Save and Record: persist current content, returning the note id. */
  async function ensureNoteId(): Promise<string | null> {
    if (isEmpty) return null;
    if (effectiveId) {
      await updateNote.mutateAsync({ title, originalContent: content });
      return effectiveId;
    }
    const created = await createNote.mutateAsync({ title, originalContent: content });
    setCreatedId(created.id);
    return created.id;
  }

  function openSave() {
    if (isEmpty) {
      toast.show('Add a title or a few words first');
      return;
    }
    setModalOpen(true);
  }

  async function handleConfirm({ folderId, tagNames }: { folderId: string | null; tagNames: string[] }) {
    try {
      if (effectiveId) {
        await updateNote.mutateAsync({ title, originalContent: content, folderId, tagNames });
        toast.show('Note saved');
        setModalOpen(false);
        router.push(`/notes/${effectiveId}`);
      } else {
        const created = await createNote.mutateAsync({ title, originalContent: content, folderId, tagNames });
        toast.show('Note created');
        setModalOpen(false);
        router.replace(`/notes/${created.id}`);
      }
    } catch {
      toast.show('Could not save — try again');
    }
  }

  return (
    <div className="screen col" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="d-top">
        <button
          onClick={() => router.push(effectiveId ? `/notes/${effectiveId}` : '/')}
          className="btn btn-ghost btn-sm"
          type="button"
        >
          <Brand className="text-[18px]" />
        </button>
        <span className="grow" style={{ flex: 1 }} />
        <span className="meta">{effectiveId ? 'saved' : 'draft'}</span>
        <Button size="sm" onClick={openSave} disabled={saving || isEmpty}>
          {note ? 'Save' : 'Save note'}
        </Button>
      </header>

      {/* Desktop: notes + recording rail. Mobile: stacked. */}
      <div className="flex-1 grid md:grid-cols-[1fr_300px]" style={{ minHeight: 0 }}>
        <div className="scrollable" style={{ overflowY: 'auto' }}>
          <div className="w-full max-w-[680px] mx-auto px-[var(--pad)] py-8">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full font-display text-[28px] font-semibold text-ink bg-transparent border-none outline-none placeholder:text-ink-3 mb-4"
            />
            <TiptapEditor content={content} onChange={setContent} />
          </div>
        </div>
        <div className="border-t md:border-t-0 md:border-l border-line">
          <RecordingRail ensureNoteId={ensureNoteId} onSaved={(id) => router.push(`/notes/${id}`)} />
        </div>
      </div>

      <SaveNoteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        folders={folders.data ?? []}
        initialFolderId={note?.folderId ?? null}
        initialTags={note?.tags.map((t) => t.name) ?? []}
        saving={saving}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
