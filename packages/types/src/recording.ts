import { z } from 'zod';
import { IsoDate, Uuid } from './common.js';

export const Recording = z.object({
  id: Uuid,
  noteId: Uuid,
  userId: Uuid,
  storagePath: z.string(),
  mimeType: z.string().default('audio/webm'),
  durationSec: z.number().int().min(0).nullable().optional(),
  sizeBytes: z.number().int().min(0).nullable().optional(),
  createdAt: IsoDate,
  /** Short-lived signed playback URL — populated on the note detail. */
  url: z.string().nullable().optional(),
});
export type Recording = z.infer<typeof Recording>;

/** Step 1: ask the backend for a signed upload slot (noteId comes from the route). */
export const SignRecordingInput = z.object({
  mimeType: z.string().default('audio/webm'),
});
export type SignRecordingInput = z.infer<typeof SignRecordingInput>;

/** Backend returns a one-time signed upload token + the storage path. */
export const SignedUploadResponse = z.object({
  recordingId: Uuid,
  path: z.string(),
  token: z.string(),
  signedUrl: z.string().url(),
});
export type SignedUploadResponse = z.infer<typeof SignedUploadResponse>;

/** Step 2: after the browser uploads, confirm metadata and queue processing. */
export const CompleteRecordingInput = z.object({
  recordingId: Uuid,
  durationSec: z.number().int().min(0).max(60 * 60).optional(),
  sizeBytes: z.number().int().min(0).optional(),
});
export type CompleteRecordingInput = z.infer<typeof CompleteRecordingInput>;
