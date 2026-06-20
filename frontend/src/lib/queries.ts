'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type {
  CreateFolderInput,
  CreateNoteInput,
  Folder,
  ListNotesQuery,
  Note,
  NoteSummary,
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
  options?: Partial<UseQueryOptions<NoteSummary[]>>,
) {
  return useQuery({
    queryKey: qk.notes(query),
    queryFn: () => apiFetch<NoteSummary[]>(`/notes${toQueryString(query)}`),
    ...options,
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: qk.note(id),
    queryFn: () => apiFetch<Note>(`/notes/${id}`),
    enabled: !!id,
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
