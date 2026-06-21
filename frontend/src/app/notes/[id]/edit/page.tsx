'use client';

import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { NoteEditor } from '@/components/editor/note-editor';
import { EmptyState } from '@/components/ui/empty-state';
import { useNote } from '@/lib/queries';

function EditNote({ id }: { id: string }) {
  const note = useNote(id);

  if (note.isLoading) {
    return <main className="min-h-screen grid place-items-center eyebrow animate-pulse">Loading…</main>;
  }
  if (note.isError || !note.data) {
    return (
      <main className="min-h-screen grid place-items-center">
        <EmptyState title="Note not found" hint="It may have been deleted, or the link is wrong." />
      </main>
    );
  }
  return <NoteEditor note={note.data} />;
}

export default function EditNotePage() {
  const params = useParams<{ id: string }>();
  return (
    <AuthGuard>
      <EditNote id={params.id} />
    </AuthGuard>
  );
}
