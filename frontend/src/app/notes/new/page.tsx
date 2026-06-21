'use client';

import { AuthGuard } from '@/components/auth-guard';
import { NoteEditor } from '@/components/editor/note-editor';

export default function NewNotePage() {
  return (
    <AuthGuard>
      <NoteEditor />
    </AuthGuard>
  );
}
