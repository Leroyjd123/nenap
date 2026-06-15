'use client';

import type { ReactNode } from 'react';
import { Brand } from '@/components/brand';

const FOLDERS = ['College', 'Work', 'Personal', 'Ideas'];

/**
 * Desktop app shell from the Hi-Fi design: 220px sidebar + main column.
 * Phase 1 is a static shell — folders/nav become live in Phase 2.
 */
export function AppShell({ children, email }: { children: ReactNode; email?: string }) {
  return (
    <div className="grid grid-cols-[220px_1fr] min-h-screen">
      <aside className="bg-surface-2 border-r border-line px-[14px] py-[18px] flex flex-col gap-1">
        <Brand className="text-[23px] px-2 pt-1 pb-4" />

        <p className="eyebrow px-2 pt-3 pb-1.5">Folders</p>
        {FOLDERS.map((f) => (
          <div
            key={f}
            className="flex items-center gap-2.5 px-[9px] py-2 rounded-sm text-ink-2 text-sm
                       cursor-default hover:bg-[color-mix(in_oklab,var(--ink)_5%,transparent)]"
          >
            {f}
          </div>
        ))}

        <div className="mt-auto flex items-center gap-2.5 px-[9px] py-2">
          <span
            className="w-8 h-8 rounded-full grid place-items-center text-white text-[13px] font-semibold flex-none"
            style={{ background: 'linear-gradient(135deg, var(--accent-soft), var(--accent))' }}
          >
            {(email?.[0] ?? 'N').toUpperCase()}
          </span>
          <span className="text-sm text-ink-2 truncate">{email ?? 'Not signed in'}</span>
        </div>
      </aside>

      <div className="flex flex-col min-w-0">
        <header className="flex items-center gap-3.5 px-[var(--pad)] py-3.5 border-b border-line">
          <h1 className="font-display text-[20px] font-medium text-ink m-0">Today</h1>
        </header>
        <main className="flex-1 p-[var(--pad)]">{children}</main>
      </div>
    </div>
  );
}
