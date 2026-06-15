'use client';

import { useRouter } from 'next/navigation';
import { NoteEditor } from '@/components/editor/note-editor';
import { useSession } from '@/hooks/use-session';

export default function NewNotePage() {
  const router = useRouter();
  const { session, loading } = useSession();

  if (loading) {
    return <main className="min-h-screen grid place-items-center eyebrow animate-pulse">Loading…</main>;
  }
  if (!session) {
    router.replace('/login');
    return null;
  }
  return <NoteEditor />;
}
