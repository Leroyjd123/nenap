'use client';

import { useParams, useRouter } from 'next/navigation';
import { NoteEditor } from '@/components/editor/note-editor';
import { EmptyState } from '@/components/ui/empty-state';
import { useNote } from '@/lib/queries';
import { useSession } from '@/hooks/use-session';

export default function NotePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { session, loading } = useSession();
  const note = useNote(params.id);

  if (loading || note.isLoading) {
    return <main className="min-h-screen grid place-items-center eyebrow animate-pulse">Loading…</main>;
  }
  if (!session) {
    router.replace('/login');
    return null;
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
