'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type {
  AccountStats,
  Attachment,
  CreateFolderInput,
  CreateNoteInput,
  Entitlements,
  Folder,
  ListNotesQuery,
  Note,
  NotesPage,
  Order,
  Plan,
  Tag,
  UpdateNoteInput,
} from '@nenap/types';
import { apiFetch } from './api';

/** Centralised query keys so mutations can invalidate precisely. */
export const qk = {
  notes: (q?: Partial<ListNotesQuery>) => ['notes', q ?? {}] as const,
  note: (id: string) => ['note', id] as const,
  folders: () => ['folders'] as const,
  tags: () => ['tags'] as const,
  entitlements: () => ['entitlements'] as const,
  orders: () => ['orders'] as const,
};

function toQueryString(q: Partial<ListNotesQuery>): string {
  const params = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export function useNotes(
  query: Partial<ListNotesQuery> = {},
  options?: Partial<UseQueryOptions<NotesPage>>,
) {
  return useQuery({
    queryKey: qk.notes(query),
    queryFn: () => apiFetch<NotesPage>(`/notes${toQueryString(query)}`),
    ...options,
  });
}

// Stop polling a "processing" note after this long so a stuck job can't hammer the
// API forever — the backend stuck-job sweep will flip it to failed and we re-fetch then.
const MAX_POLL_MS = 5 * 60 * 1000;

export function useNote(id: string, opts?: { poll?: boolean }) {
  return useQuery({
    queryKey: qk.note(id),
    queryFn: () => apiFetch<Note>(`/notes/${id}`),
    enabled: !!id,
    // While a note is processing, poll so the enhanced note appears when ready —
    // but give up after MAX_POLL_MS to avoid an endless refetch loop.
    refetchInterval: (q) => {
      const note = q.state.data;
      if (!opts?.poll || note?.status !== 'processing') return false;
      const since = note.updatedAt ? new Date(note.updatedAt).getTime() : 0;
      if (since && Date.now() - since > MAX_POLL_MS) return false;
      return 2500;
    },
  });
}

export function useFolders() {
  return useQuery({ queryKey: qk.folders(), queryFn: () => apiFetch<Folder[]>('/folders') });
}

export function useTags() {
  return useQuery({ queryKey: qk.tags(), queryFn: () => apiFetch<Tag[]>('/tags') });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateFolderInput) =>
      apiFetch<Folder>('/folders', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.folders() }),
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNoteInput) =>
      apiFetch<Note>('/notes', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notes'] });
      void qc.invalidateQueries({ queryKey: qk.tags() });
    },
  });
}

export function useUpdateNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) =>
      apiFetch<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    onSuccess: (note) => {
      qc.setQueryData(qk.note(id), note);
      void qc.invalidateQueries({ queryKey: ['notes'] });
      void qc.invalidateQueries({ queryKey: qk.tags() });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<void>(`/notes/${id}`, { method: 'DELETE' }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['notes'] }),
  });
}

/** "Improve again" — re-runs enhancement; the note returns to processing. */
export function useImproveNote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ status: string }>(`/notes/${id}/improve`, { method: 'POST' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.note(id) });
      void qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

/** The current user's plan, effective tier, limits, usage, and any active booster. */
export function useEntitlements() {
  return useQuery({
    queryKey: qk.entitlements(),
    queryFn: () => apiFetch<Entitlements>('/billing/entitlements'),
    staleTime: 30 * 1000,
  });
}

/** DEV: set the subscription tier (stand-in for Stripe checkout). */
export function useSetPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: Plan) => apiFetch<void>('/billing/dev/plan', { method: 'POST', body: JSON.stringify({ plan }) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: qk.entitlements() });
      void qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

/** The user's purchase history (order list) for the account page. */
export function useOrders() {
  return useQuery({
    queryKey: qk.orders(),
    queryFn: () => apiFetch<Order[]>('/billing/orders'),
    staleTime: 30 * 1000,
  });
}

/** Lifetime usage counters for the account page. */
export function useAccountStats() {
  return useQuery({
    queryKey: ['account-stats'],
    queryFn: () => apiFetch<AccountStats>('/me/stats'),
    staleTime: 30 * 1000,
  });
}

/** Permanently delete the account and all its data. */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => apiFetch<void>('/me', { method: 'DELETE' }),
  });
}

/** DEV: grant a booster pass (Pro for N days). */
export function useGrantPass() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (days: 1 | 3 | 5) =>
      apiFetch<void>('/billing/dev/pass', { method: 'POST', body: JSON.stringify({ days, level: 'pro' }) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.entitlements() }),
  });
}

/** A note's attachments, each with a short-lived signed URL for display/download. */
export function useAttachments(noteId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['attachments', noteId],
    queryFn: () => apiFetch<Attachment[]>(`/notes/${noteId}/attachments`),
    enabled: enabled && !!noteId,
  });
}

export function useDeleteAttachment(noteId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId: string) =>
      apiFetch<void>(`/notes/${noteId}/attachments/${attachmentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['attachments', noteId] });
      void qc.invalidateQueries({ queryKey: qk.note(noteId) });
    },
  });
}

/** Short-lived signed URL for playing back a note's recording. */
export function useRecordingUrl(noteId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['recording-url', noteId],
    queryFn: () => apiFetch<{ url: string | null }>(`/notes/${noteId}/recording/url`),
    enabled,
    staleTime: 50 * 60 * 1000,
  });
}
