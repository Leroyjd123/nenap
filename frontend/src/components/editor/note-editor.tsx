'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Note } from '@nenap/types';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { TiptapEditor } from './tiptap-editor';
import { SaveNoteModal } from './save-note-modal';
import { useCreateNote, useDeleteNote, useFolders, useUpdateNote } from '@/lib/queries';

/**
 * Note editor for both new and existing notes. Capture-first: open straight into
 * writing; choose folder/tags only at save time.
 */
export function NoteEditor({ note }: { note?: Note }) {
  const router = useRouter();
  const toast = useToast();
  const folders = useFolders();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote(note?.id ?? '');
  const deleteNote = useDeleteNote();

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

  async function handleConfirm({ folderId, tagNames }: { folderId: string | null; tagNames: string[] }) {
    try {
      if (note) {
        await updateNote.mutateAsync({ title, originalContent: content, folderId, tagNames });
        toast.show('Note saved');
      } else {
        const created = await createNote.mutateAsync({
          title,
          originalContent: content,
          folderId,
          tagNames,
        });
        toast.show('Note created');
        router.replace(`/notes/${created.id}`);
      }
      setModalOpen(false);
    } catch {
      toast.show('Could not save — try again');
    }
  }

  async function handleDelete() {
    if (!note) return;
    if (!window.confirm('Delete this note? This cannot be undone.')) return;
    await deleteNote.mutateAsync(note.id);
    toast.show('Note deleted');
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-3 px-[var(--pad)] py-3.5 border-b border-line">
        <button onClick={() => router.push('/')} className="text-ink-2 hover:text-ink text-sm" type="button">
          ← Notes
        </button>
        <Brand className="text-[18px] mx-auto md:mx-0" />
        <div className="ml-auto flex items-center gap-2">
          {note && (
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button size="sm" onClick={() => setModalOpen(true)} disabled={saving}>
            {note ? 'Save' : 'Save note'}
          </Button>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[720px] mx-auto px-[var(--pad)] py-8">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full font-display text-[28px] font-semibold text-ink bg-transparent
                     border-none outline-none placeholder:text-ink-3 mb-4"
        />
        <TiptapEditor content={content} onChange={setContent} />
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
