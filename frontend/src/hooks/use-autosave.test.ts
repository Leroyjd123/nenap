import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDraftIfNewer, clearDraft } from '@/hooks/use-autosave';

// vitest's node env has no localStorage — provide a minimal in-memory stub.
beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  });
});

const KEY = 'nenap:draft:note-1';

describe('getDraftIfNewer', () => {
  it('returns the draft when it is newer than the server timestamp', () => {
    localStorage.setItem(KEY, JSON.stringify({ title: 'T', originalContent: '<p>x</p>', savedAt: 2000 }));
    expect(getDraftIfNewer('note-1', new Date(1000))).toEqual({ title: 'T', originalContent: '<p>x</p>' });
  });

  it('returns null and clears a stale draft (older than server)', () => {
    localStorage.setItem(KEY, JSON.stringify({ title: 'T', savedAt: 500 }));
    expect(getDraftIfNewer('note-1', new Date(1000))).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('returns null when no draft exists', () => {
    expect(getDraftIfNewer('note-1', new Date())).toBeNull();
  });

  it('clears a corrupt draft and returns null', () => {
    localStorage.setItem(KEY, '{not valid json');
    expect(getDraftIfNewer('note-1', new Date(0))).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

describe('clearDraft', () => {
  it('removes the stored draft', () => {
    localStorage.setItem(KEY, JSON.stringify({ savedAt: 1 }));
    clearDraft('note-1');
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
