'use client';

import { useParams } from 'next/navigation';
import { AuthGuard } from '@/components/auth-guard';
import { NoteView } from '@/components/note-view';
import { EmptyState } from '@/components/ui/empty-state';
import { useNote } from '@/lib/queries';

function NoteDetail({ id }: { id: string }) {
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
  return <NoteView note={note.data} />;
}

export default function NotePage() {
  const params = useParams<{ id: string }>();
  return (
    <AuthGuard>
      <NoteDetail id={params.id} />
    </AuthGuard>
  );
}
