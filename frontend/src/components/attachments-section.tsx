'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Icon } from '@/components/ui/icon';
import { useToast } from '@/components/ui/toast';
import { qk, useAttachments, useDeleteAttachment, useEntitlements } from '@/lib/queries';
import { fmtBytes, uploadAttachment } from '@/lib/attachments';
import { ApiError } from '@/lib/api';

interface Props {
  noteId: string | null;
  /** For the editor: creates a draft note on first attach if none exists yet. */
  ensureNoteId?: () => Promise<string | null>;
  editable?: boolean;
}

/** Photos (grid) + files (list) on a note, with per-tier upload gating. */
export function AttachmentsSection({ noteId, ensureNoteId, editable }: Props) {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const ent = useEntitlements();
  const list = useAttachments(noteId);
  const del = useDeleteAttachment(noteId ?? '');
  const [busy, setBusy] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const canFiles = ent.data?.limits.fileUploads ?? true;
  const attachments = list.data ?? [];
  const images = attachments.filter((a) => a.kind === 'image');
  const files = attachments.filter((a) => a.kind === 'file');

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setBusy(true);
    try {
      const id = noteId ?? (ensureNoteId ? await ensureNoteId() : null);
      if (!id) {
        toast.show('Add a title or some text first');
        return;
      }
      for (const f of Array.from(fileList)) {
        await uploadAttachment(id, f);
      }
      void qc.invalidateQueries({ queryKey: ['attachments', id] });
      void qc.invalidateQueries({ queryKey: qk.note(id) });
      toast.show(fileList.length > 1 ? 'Added' : 'Added — looks good');
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) {
        toast.show(e.message);
        router.push('/plans');
      } else {
        toast.show(e instanceof Error ? e.message : 'Could not add');
      }
    } finally {
      setBusy(false);
      if (photoInput.current) photoInput.current.value = '';
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  if (!editable && attachments.length === 0) return null;

  return (
    <div style={{ marginTop: 18 }}>
      <div className="row between" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="eyebrow">Attachments</span>
        {editable && (
          <div className="row" style={{ display: 'flex', gap: 6 }}>
            <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            <input ref={fileInput} type="file" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            <button className="btn btn-soft btn-sm" disabled={busy} onClick={() => photoInput.current?.click()}>
              <Icon name="plus" size={14} /> Photo
            </button>
            {canFiles ? (
              <button className="btn btn-soft btn-sm" disabled={busy} onClick={() => fileInput.current?.click()}>
                <Icon name="doc" size={14} /> File
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => router.push('/plans')} title="File uploads are available on Basic and Pro">
                <Icon name="doc" size={14} /> File (Pro)
              </button>
            )}
          </div>
        )}
      </div>

      {busy && <p className="meta" style={{ marginBottom: 8 }}>Uploading…</p>}

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8, marginBottom: files.length ? 12 : 0 }}>
          {images.map((a) => (
            <div key={a.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--r-sm)', overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--surface-2)' }}>
              {a.url && (
                <a href={a.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </a>
              )}
              {editable && (
                <button
                  onClick={() => del.mutate(a.id)}
                  aria-label={`Remove ${a.name}`}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: 99, width: 22, height: 22, cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                >
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {files.map((a) => (
        <div key={a.id} className="row between" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', marginBottom: 6, background: 'var(--surface)' }}>
          <Icon name="doc" size={16} style={{ color: 'var(--ink-3)', flex: 'none' }} />
          <a href={a.url ?? '#'} target="_blank" rel="noreferrer" className="grow truncate" style={{ flex: 1, fontSize: 13.5, color: 'var(--ink)', textDecoration: 'none' }}>
            {a.name}
          </a>
          <span className="meta">{fmtBytes(a.sizeBytes)}</span>
          {editable && (
            <button onClick={() => del.mutate(a.id)} aria-label={`Remove ${a.name}`} className="btn btn-ghost btn-sm" style={{ padding: 4 }}>
              <Icon name="trash" size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
