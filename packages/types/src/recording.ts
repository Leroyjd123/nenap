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
});
export type Recording = z.infer<typeof Recording>;

/** Backend issues a signed URL; the browser uploads the file directly to storage. */
export const CreateUploadUrlInput = z.object({
  noteId: Uuid,
  mimeType: z.string().default('audio/webm'),
  durationSec: z.number().int().min(0).max(60 * 60).optional(),
});
export type CreateUploadUrlInput = z.infer<typeof CreateUploadUrlInput>;

export const UploadUrlResponse = z.object({
  uploadUrl: z.string().url(),
  storagePath: z.string(),
  recordingId: Uuid,
});
export type UploadUrlResponse = z.infer<typeof UploadUrlResponse>;
