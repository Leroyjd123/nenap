'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ListNotesQuery } from '@nenap/types';
import { AppShell } from '@/components/app-shell';
import { NoteCard } from '@/components/note-card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { NoteCardSkeleton } from '@/components/ui/skeleton';
import { useFolders, useNotes, useTags } from '@/lib/queries';
import { useDebounced } from '@/hooks/use-debounced';

export function Dashboard({ email }: { email?: string }) {
  const router = useRouter();
  const [folderId, setFolderId] = useState<string | undefined>();
  const [hasRecording, setHasRecording] = useState(false);
  const [tag, setTag] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounced(search, 250);

  const query = useMemo<Partial<ListNotesQuery>>(
    () => ({
      folderId,
      hasRecording: hasRecording || undefined,
      tag,
      q: debouncedSearch || undefined,
    }),
    [folderId, hasRecording, tag, debouncedSearch],
  );

  const folders = useFolders();
  const tags = useTags();
  const notes = useNotes(query);

  return (
    <AppShell
      email={email}
      folders={folders.data ?? []}
      activeFolderId={folderId}
      onSelectFolder={(id) => setFolderId(id)}
      headerActions={
        <Button size="sm" onClick={() => router.push('/notes/new')}>
          New note
        </Button>
      }
    >
      <div className="max-w-[920px] mx-auto flex flex-col gap-5">
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-surface border border-line-2 rounded-full px-4 py-2.5 focus-within:border-accent">
          <span className="text-ink-3 font-mono text-xs">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your notes…"
            className="border-none bg-transparent outline-none font-ui text-sm text-ink w-full placeholder:text-ink-3"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Chip label="With recording" active={hasRecording} onClick={() => setHasRecording((v) => !v)} />
          {(tags.data ?? []).slice(0, 8).map((t) => (
            <Chip
              key={t.id}
              label={t.name}
              active={tag === t.name}
              onClick={() => setTag(tag === t.name ? undefined : t.name)}
            />
          ))}
        </div>

        {/* Notes */}
        {notes.isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
            <NoteCardSkeleton />
          </div>
        ) : notes.isError ? (
          <EmptyState
            title="We couldn't reach your notes"
            hint="The backend may be starting up, or you're not signed in yet."
          />
        ) : (notes.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="The space is yours when you're ready."
            hint="Start a note and write naturally. You can record alongside it any time."
            action={<Button onClick={() => router.push('/notes/new')}>Create your first note</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {notes.data!.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
