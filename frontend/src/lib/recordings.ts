import type { Recording, SignedUploadResponse } from '@nenap/types';
import { apiFetch } from './api';
import { getSupabaseBrowserClient } from './supabase/client';

const BUCKET = 'recordings';

/**
 * Three-step upload: ask the backend for a signed slot, upload the audio directly to
 * Supabase Storage, then confirm metadata (which queues processing). The audio bytes
 * never pass through our backend.
 */
export async function uploadRecording(
  noteId: string,
  blob: Blob,
  mimeType: string,
  durationSec: number,
): Promise<Recording> {
  const signed = await apiFetch<SignedUploadResponse>(`/notes/${noteId}/recording/sign`, {
    method: 'POST',
    body: JSON.stringify({ mimeType }),
  });

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, blob, { contentType: mimeType });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return apiFetch<Recording>(`/notes/${noteId}/recording/complete`, {
    method: 'POST',
    body: JSON.stringify({ recordingId: signed.recordingId, durationSec, sizeBytes: blob.size }),
  });
}

/** mm:ss formatter for the recording timer. */
export function fmtDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
