'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { ListNotesQuery } from '@nenap/types';
import { AppShell } from '@/components/app-shell';
import { NoteCard } from '@/components/note-card';
import { NoteRow } from '@/components/note-row';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { Icon } from '@/components/ui/icon';
import { Segmented } from '@/components/ui/segmented';
import { NoteCardSkeleton } from '@/components/ui/skeleton';
import { useFolders, useNotes } from '@/lib/queries';
import { useDebounced } from '@/hooks/use-debounced';
import { useDocumentTitle } from '@/hooks/use-document-title';

const PAGE_SIZE = 20;
type View = 'cards' | 'list';

export function Dashboard({ email }: { email?: string }) {
  useDocumentTitle('Your notes — Nenap');
  const router = useRouter();
  const [folderId, setFolderId] = useState<string | undefined>();
  const [withRec, setWithRec] = useState(false);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const [view, setView] = useState<View>('cards');
  const [navTo, setNavTo] = useState<string | null>(null);
  const debouncedSearch = useDebounced(search, 250);

  // Restore the saved view preference.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('nenap-view') : null;
    if (saved === 'cards' || saved === 'list') setView(saved);
  }, []);
  function changeView(v: View) {
    setView(v);
    try { localStorage.setItem('nenap-view', v); } catch { /* private mode */ }
  }

  // Warm the primary destinations so the first click feels instant.
  useEffect(() => {
    router.prefetch('/notes/new');
    router.prefetch('/record');
  }, [router]);

  // Any filter change resets to the first page.
  useEffect(() => { setPage(0); }, [folderId, withRec, debouncedSearch, fromDate, toDate]);

  const go = (path: string) => { setNavTo(path); router.push(path); };

  const query = useMemo<Partial<ListNotesQuery>>(
    () => ({
      folderId,
      hasRecording: withRec || undefined,
      q: debouncedSearch || undefined,
      from: fromDate ? new Date(`${fromDate}T00:00:00`).toISOString() : undefined,
      to: toDate ? new Date(`${toDate}T23:59:59.999`).toISOString() : undefined,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
    [folderId, withRec, debouncedSearch, fromDate, toDate, page],
  );

  const folders = useFolders();
  const notes = useNotes(query, {
    refetchInterval: (q) => ((q.state.data?.items ?? []).some((n) => n.status === 'processing') ? 3000 : false),
  });
  const activeFolder = folders.data?.find((f) => f.id === folderId);
  const items = notes.data?.items ?? [];
  const total = notes.data?.total ?? 0;
  const start = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, total);
  const hasPrev = page > 0;
  const hasNext = (page + 1) * PAGE_SIZE < total;

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
    <AppShell email={email} folders={folders.data ?? []} activeFolderId={folderId} onSelectFolder={setFolderId} top={topBar}>
      {/* Mobile search */}
      <label className="search-field md:hidden" style={{ marginBottom: 14 }}>
        <Icon name="search" size={17} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search notes…" />
      </label>

      <div className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="col" style={{ minWidth: 0 }}>
          <span className="eyebrow">{activeFolder ? 'Folder' : 'Your notes'}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, margin: '2px 0 0', letterSpacing: '-0.01em' }}>
            {activeFolder ? activeFolder.name : 'All Notes'}
          </h2>
        </div>
        <div className="row" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip active={!withRec} onClick={() => setWithRec(false)}>Everything</Chip>
          <Chip active={withRec} onClick={() => setWithRec(true)}><Icon name="wave" size={13} /> With recording</Chip>
          <Segmented
            value={view}
            onChange={changeView}
            options={[{ value: 'cards', label: 'Cards' }, { value: 'list', label: 'List' }]}
          />
        </div>
      </div>

      {/* Date range */}
      <div className="row" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="meta">From</span>
        <input type="date" className="input" style={{ width: 'auto', padding: '6px 10px' }} value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
        <span className="meta">to</span>
        <input type="date" className="input" style={{ width: 'auto', padding: '6px 10px' }} value={toDate} min={fromDate || undefined} onChange={(e) => setToDate(e.target.value)} />
        {(fromDate || toDate) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setFromDate(''); setToDate(''); }}>
            <Icon name="x" size={14} /> Clear dates
          </button>
        )}
      </div>

      {notes.isLoading ? (
        <div className="grid sm:grid-cols-2 gap-3.5">
          <NoteCardSkeleton /><NoteCardSkeleton /><NoteCardSkeleton /><NoteCardSkeleton />
        </div>
      ) : notes.isError ? (
        <EmptyState title="We couldn't reach your notes" hint="The backend may be starting up, or you're not signed in yet." />
      ) : items.length === 0 ? (
        <EmptyState
          title={search || fromDate || toDate || folderId || withRec ? 'Nothing matches those filters.' : 'The space is yours when you’re ready.'}
          hint={search || fromDate || toDate || folderId || withRec ? 'Try widening your search or clearing filters.' : 'Start a note and write naturally. You can record alongside it any time.'}
          action={<Button onClick={() => go('/notes/new')} loading={navTo === '/notes/new'}>Create your first note</Button>}
        />
      ) : view === 'cards' ? (
        <div className="grid sm:grid-cols-2 gap-3.5 stagger">
          {items.map((note) => <NoteCard key={note.id} note={note} folders={folders.data} />)}
        </div>
      ) : (
        <div className="col stagger" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((note) => <NoteRow key={note.id} note={note} folders={folders.data} />)}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 22 }}>
          <span className="meta">{start}–{end} of {total}</span>
          <div className="row" style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" disabled={!hasPrev} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <Icon name="back" size={15} /> Prev
            </Button>
            <Button variant="ghost" size="sm" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
              Next <Icon name="chevR" size={15} />
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
