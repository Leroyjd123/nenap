'use client';

import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import type { Folder } from '@nenap/types';
import { CreateFolderModal } from '@/components/create-folder-modal';
import { Icon } from '@/components/ui/icon';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { cn } from '@/lib/cn';

interface AppShellProps {
  children: ReactNode;
  top?: ReactNode; // desktop d-top bar content (search + actions)
  email?: string;
  folders: Folder[];
  activeFolderId?: string;
  onSelectFolder: (id?: string) => void;
}

/** Dashboard shell from the Hi-Fi design: 220px sidebar + main on desktop; m-top + tabbar + FAB on mobile. */
export function AppShell({ children, top, email, folders, activeFolderId, onSelectFolder }: AppShellProps) {
  const router = useRouter();
  const [folderModal, setFolderModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace('/login');
  }

  const initial = (email?.[0] ?? 'N').toUpperCase();

  return (
    <>
      {/* ===== Desktop ===== */}
      <div className="d-shell hidden md:grid">
        <aside className="d-side">
          <div className="brand" style={{ fontSize: 23, padding: '4px 8px 16px', cursor: 'pointer' }} onClick={() => onSelectFolder(undefined)}>
            Nenap<span className="dot">.</span>
          </div>
          <div className="side-lab">Folders</div>
          <button className={cn('nav-item', !activeFolderId && 'on')} onClick={() => onSelectFolder(undefined)}>
            <Icon name="home" size={17} />
            <span className="grow" style={{ flex: 1 }}>All notes</span>
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              className={cn('nav-item', activeFolderId === f.id && 'on')}
              onClick={() => onSelectFolder(f.id)}
            >
              <Icon name="folder" size={17} />
              <span className="grow" style={{ flex: 1 }}>{f.name}</span>
              {f.noteCount !== undefined && <span className="ct">{f.noteCount}</span>}
            </button>
          ))}
          <button className="nav-item nav-add" onClick={() => setFolderModal(true)}>
            <Icon name="plus" size={16} /> New folder
          </button>

          <div className="grow" style={{ flex: 1 }} />
          <hr className="hr" style={{ margin: '8px 4px' }} />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="nav-item"
              style={{ gap: 9 }}
            >
              <span className="av">{initial}</span>
              <span className="grow truncate" style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>
                {email ?? 'Account'}
              </span>
              <Icon name="chevD" size={14} />
            </button>
            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-line-2 rounded-sm shadow-2 p-1">
                <button className="nav-item" onClick={logout}>Log out</button>
              </div>
            )}
          </div>
        </aside>

        <div className="d-main">
          {top && <div className="d-top">{top}</div>}
          <div className="d-content scrollable" style={{ padding: '20px var(--pad) 40px' }}>
            {children}
          </div>
        </div>
      </div>

      {/* ===== Mobile ===== */}
      <div className="md:hidden flex flex-col min-h-screen">
        <div className="m-top">
          <div className="brand">Nenap<span className="dot">.</span></div>
          <button onClick={logout} className="btn btn-ghost btn-sm">Log out</button>
        </div>
        <div className="grow scrollable" style={{ flex: 1, padding: '0 var(--pad) 90px' }}>
          {children}
        </div>
        <div className="m-fab">
          <button className="btn btn-primary" style={{ borderRadius: 99, padding: '13px 20px', boxShadow: 'var(--shadow-2)' }} onClick={() => router.push('/notes/new')}>
            <Icon name="plus" size={18} /> New note
          </button>
        </div>
        <nav className="m-tabbar">
          <div className="m-tab on"><Icon name="home" size={21} /> Home</div>
          <div className="m-tab" onClick={() => setFolderModal(true)}><Icon name="folder" size={21} /> Folders</div>
        </nav>
      </div>

      <CreateFolderModal open={folderModal} onClose={() => setFolderModal(false)} />
    </>
  );
}
