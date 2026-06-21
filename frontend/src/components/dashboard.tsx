'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { ListNotesQuery } from '@nenap/types';
import { AppShell } from '@/components/app-shell';
import { NoteCard } from '@/components/note-card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { NoteCardSkeleton } from '@/components/ui/skeleton';
import { useFolders, useNotes } from '@/lib/queries';
import { useDebounced } from '@/hooks/use-debounced';

export function Dashboard({ email }: { email?: string }) {
  const router = useRouter();
  const [folderId, setFolderId] = useState<string | undefined>();
  const [withRec, setWithRec] = useState(false);
  const [search, setSearch] = useState('');
  const [navTo, setNavTo] = useState<string | null>(null);
  const debouncedSearch = useDebounced(search, 250);

  // Navigation can take a beat; show a spinner immediately so the click registers.
  const go = (path: string) => {
    setNavTo(path);
    router.push(path);
  };

  const query = useMemo<Partial<ListNotesQuery>>(
    () => ({ folderId, hasRecording: withRec || undefined, q: debouncedSearch || undefined }),
    [folderId, withRec, debouncedSearch],
  );

  const folders = useFolders();
  const notes = useNotes(query);
  const activeFolder = folders.data?.find((f) => f.id === folderId);

  const topBar = (
    <>
      <label className="search-field grow" style={{ flex: 1, maxWidth: 340 }}>
        <Icon name="search" size={17} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes, tags…" />
      </label>
      <span className="grow" style={{ flex: 1 }} />
      <Button variant="rec" onClick={() => go('/record')} loading={navTo === '/record'}>
        <Icon name="mic" size={17} /> Record
      </Button>
      <Button onClick={() => go('/notes/new')} loading={navTo === '/notes/new'}>
        <Icon name="plus" size={17} /> New note
      </Button>
    </>
  );

  return (
    <AppShell
      email={email}
      folders={folders.data ?? []}
      activeFolderId={folderId}
      onSelectFolder={setFolderId}
      top={topBar}
    >
      {/* Mobile search (desktop search lives in the top bar) */}
      <label className="search-field md:hidden" style={{ marginBottom: 14 }}>
        <Icon name="search" size={17} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" />
      </label>

      <div className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div className="col" style={{ minWidth: 0 }}>
          <span className="eyebrow">{activeFolder ? 'Folder' : 'Your notes'}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '2px 0 0', letterSpacing: '-0.01em' }}>
            {activeFolder ? activeFolder.name : 'All Notes'}
          </h2>
        </div>
        <div className="row" style={{ display: 'flex', gap: 7, flex: 'none' }}>
          <Chip active={!withRec} onClick={() => setWithRec(false)}>Everything</Chip>
          <Chip active={withRec} onClick={() => setWithRec(true)}>
            <Icon name="wave" size={13} /> With recording
          </Chip>
        </div>
      </div>

      {notes.isLoading ? (
        <div className="grid sm:grid-cols-2 gap-3.5">
          <NoteCardSkeleton />
          <NoteCardSkeleton />
          <NoteCardSkeleton />
          <NoteCardSkeleton />
        </div>
      ) : notes.isError ? (
        <EmptyState title="We couldn't reach your notes" hint="The backend may be starting up, or you're not signed in yet." />
      ) : (notes.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="The space is yours when you're ready."
          hint="Start a note and write naturally. You can record alongside it any time."
          action={<Button onClick={() => go('/notes/new')} loading={navTo === '/notes/new'}>Create your first note</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3.5">
          {notes.data!.map((note) => (
            <NoteCard key={note.id} note={note} folders={folders.data} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
