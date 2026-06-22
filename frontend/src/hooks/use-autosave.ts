import { useCallback, useEffect, useRef, useState } from 'react';
import { useUpdateNote } from '@/lib/queries';
import { useToast } from '@/components/ui/toast';

const AUTOSAVE_DELAY_MS = 2000; // save 2s after the last change
const DRAFT_KEY_PREFIX = 'nenap:draft:';

/** The note fields we autosave / recover. */
export interface DraftPayload {
  title?: string;
  originalContent?: string;
}

/** What we persist to localStorage: the fields plus when they were captured. */
interface StoredDraft extends DraftPayload {
  savedAt: number;
}

const draftKey = (noteId: string) => `${DRAFT_KEY_PREFIX}${noteId}`;

/**
 * Debounced server autosave for an existing note, with a localStorage mirror for
 * crash recovery. Returns a stable `autosave(payload)` plus reactive status flags.
 * Disabled (no-op) until the note exists, so brand-new notes save explicitly first.
 */
export function useAutosave(noteId: string | null, data: DraftPayload, enabled = true) {
  const updateNote = useUpdateNote(noteId ?? '');
  const toast = useToast();
  // Hold the latest mutation/toast in refs so `autosave` keeps a stable identity.
  const updateRef = useRef(updateNote);
  updateRef.current = updateNote;
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastSavedRef = useRef<string>('');
  const [hasUnsaved, setHasUnsaved] = useState(false);

  // Mirror the latest content to localStorage on every change (cheap crash insurance).
  useEffect(() => {
    if (!noteId) return;
    const payload: StoredDraft = { title: data.title, originalContent: data.originalContent, savedAt: Date.now() };
    try {
      localStorage.setItem(draftKey(noteId), JSON.stringify(payload));
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [noteId, data.title, data.originalContent]);

  const autosave = useCallback(
    (payload: DraftPayload) => {
      if (!noteId || !enabled) return;
      const serialized = JSON.stringify(payload);
      if (serialized === lastSavedRef.current) return; // nothing changed since last save
      setHasUnsaved(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        updateRef.current
          .mutateAsync(payload)
          .then(() => {
            lastSavedRef.current = serialized;
            setHasUnsaved(false);
            try {
              localStorage.removeItem(draftKey(noteId));
            } catch {
              /* ignore */
            }
          })
          .catch((err: unknown) => {
            // A superseded save is cancelled by react-query — not a real failure.
            if ((err as Error)?.message !== 'cancelled') {
              toastRef.current.show('Autosave failed — your draft is saved locally');
            }
          });
      }, AUTOSAVE_DELAY_MS);
    },
    [noteId, enabled],
  );

  // Cancel a pending save on unmount.
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return { autosave, isSaving: updateNote.isPending, hasUnsaved };
}

/**
 * Returns a localStorage draft for a note only if it's newer than the server's last
 * save — i.e. real unsaved work (e.g. after a crash). Stale drafts are cleared.
 */
export function getDraftIfNewer(noteId: string, serverUpdatedAt: Date): DraftPayload | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(draftKey(noteId));
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as StoredDraft;
    if (typeof draft.savedAt === 'number' && draft.savedAt > serverUpdatedAt.getTime()) {
      return { title: draft.title, originalContent: draft.originalContent };
    }
    clearDraft(noteId); // stale — server is at least as fresh
    return null;
  } catch {
    clearDraft(noteId); // corrupt
    return null;
  }
}

/** Remove the localStorage draft for a note. */
export function clearDraft(noteId: string): void {
  try {
    localStorage.removeItem(draftKey(noteId));
  } catch {
    /* ignore */
  }
}
