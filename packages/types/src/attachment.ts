import { z } from 'zod';
import { IsoDate, Uuid } from './common.js';

export const AttachmentKind = z.enum(['image', 'file']);
export type AttachmentKind = z.infer<typeof AttachmentKind>;

export const Attachment = z.object({
  id: Uuid,
  noteId: Uuid,
  userId: Uuid,
  kind: AttachmentKind,
  storagePath: z.string(),
  mimeType: z.string(),
  name: z.string(),
  sizeBytes: z.number().int().min(0),
  createdAt: IsoDate,
  /** Short-lived signed URL for display/download — present on the list endpoint. */
  url: z.string().nullable().optional(),
});
export type Attachment = z.infer<typeof Attachment>;

/** Step 1: ask for a signed upload slot (noteId from the route). */
export const SignAttachmentInput = z.object({
  kind: AttachmentKind,
  mimeType: z.string().min(1),
  name: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().min(0).max(50 * 1024 * 1024), // 50 MB hard ceiling
});
export type SignAttachmentInput = z.infer<typeof SignAttachmentInput>;

export const SignedAttachmentResponse = z.object({
  attachmentId: Uuid,
  storagePath: z.string(),
  token: z.string(),
  signedUrl: z.string().url(),
});
export type SignedAttachmentResponse = z.infer<typeof SignedAttachmentResponse>;

/** Step 2: after the browser uploads, persist the attachment row. */
export const CreateAttachmentInput = z.object({
  attachmentId: Uuid,
  kind: AttachmentKind,
  mimeType: z.string().min(1),
  name: z.string().trim().min(1).max(255),
  sizeBytes: z.number().int().min(0),
  storagePath: z.string().min(1),
});
export type CreateAttachmentInput = z.infer<typeof CreateAttachmentInput>;
