'use client';

import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { Folder } from '@nenap/types';
import { Brand } from '@/components/brand';
import { cn } from '@/lib/cn';

interface AppShellProps {
  children: ReactNode;
  email?: string;
  folders: Folder[];
  activeFolderId?: string;
  onSelectFolder: (id?: string) => void;
  headerActions?: ReactNode;
  title?: string;
}

/**
 * Responsive app shell from the Hi-Fi design: 220px sidebar + main column on desktop;
 * the sidebar collapses on mobile, with a floating "New note" action.
 */
export function AppShell({
  children,
  email,
  folders,
  activeFolderId,
  onSelectFolder,
  headerActions,
  title = 'Today',
}: AppShellProps) {
  const router = useRouter();

  return (
    <div className="md:grid md:grid-cols-[220px_1fr] min-h-screen">
      <aside className="hidden md:flex bg-surface-2 border-r border-line px-3.5 py-4.5 flex-col gap-1">
        <Brand className="text-[23px] px-2 pt-1 pb-4" />

        <NavItem label="All notes" active={!activeFolderId} onClick={() => onSelectFolder(undefined)} />

        <p className="eyebrow px-2 pt-3 pb-1.5">Folders</p>
        {folders.map((f) => (
          <NavItem
            key={f.id}
            label={f.name}
            count={f.noteCount}
            active={activeFolderId === f.id}
            onClick={() => onSelectFolder(f.id)}
          />
        ))}

        <div className="mt-auto flex items-center gap-2.5 px-2.5 py-2">
          <Avatar email={email} />
          <span className="text-sm text-ink-2 truncate">{email ?? 'Not signed in'}</span>
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        <header className="flex items-center gap-3.5 px-[var(--pad)] py-3.5 border-b border-line">
          <Brand className="text-[20px] md:hidden" />
          <h1 className="font-display text-[20px] font-medium text-ink m-0 hidden md:block">{title}</h1>
          <div className="ml-auto flex items-center gap-2">{headerActions}</div>
        </header>
        <main className="flex-1 p-[var(--pad)] pb-24 md:pb-[var(--pad)]">{children}</main>
      </div>

      {/* Mobile floating action — capture-first */}
      <button
        type="button"
        onClick={() => router.push('/notes/new')}
        className="md:hidden fixed right-5 bottom-6 z-10 w-14 h-14 rounded-full bg-accent text-white
                   shadow-2 grid place-items-center text-2xl leading-none"
        aria-label="New note"
      >
        +
      </button>
    </div>
  );
}

function NavItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-sm transition-colors text-left',
        active
          ? 'bg-accent-tint text-accent-deep font-semibold'
          : 'text-ink-2 hover:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)] hover:text-ink',
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className={cn('ml-auto font-mono text-[11px]', active ? 'text-accent-deep/70' : 'text-ink-3')}>
          {count}
        </span>
      )}
    </button>
  );
}

function Avatar({ email }: { email?: string }) {
  return (
    <span
      className="w-8 h-8 rounded-full grid place-items-center text-white text-[13px] font-semibold flex-none"
      style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--accent))' }}
    >
      {(email?.[0] ?? 'N').toUpperCase()}
    </span>
  );
}
