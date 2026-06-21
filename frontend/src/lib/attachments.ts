import type { Attachment, AttachmentKind, SignedAttachmentResponse } from '@nenap/types';
import { apiFetch } from './api';
import { getSupabaseBrowserClient } from './supabase/client';

const BUCKET = 'attachments';

export function kindFor(file: File): AttachmentKind {
  return file.type.startsWith('image/') ? 'image' : 'file';
}

/** Sign → upload direct to Storage → persist the row. Mirrors the recordings flow. */
export async function uploadAttachment(noteId: string, file: File): Promise<Attachment> {
  const kind = kindFor(file);
  const mimeType = file.type || 'application/octet-stream';
  const meta = { kind, mimeType, name: file.name, sizeBytes: file.size };

  const signed = await apiFetch<SignedAttachmentResponse>(`/notes/${noteId}/attachments/sign`, {
    method: 'POST',
    body: JSON.stringify(meta),
  });

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(signed.storagePath, signed.token, file, { contentType: mimeType });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return apiFetch<Attachment>(`/notes/${noteId}/attachments`, {
    method: 'POST',
    body: JSON.stringify({ ...meta, attachmentId: signed.attachmentId, storagePath: signed.storagePath }),
  });
}

export function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
