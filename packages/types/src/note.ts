import { z } from 'zod';
import { IsoDate, Uuid } from './common.js';
import { NoteStatus } from './enums.js';
import { Tag } from './tag.js';
import { Recording } from './recording.js';
import { EnhancedNoteVersion, Transcript } from './processing.js';

/** A note as returned in list views (lightweight — for dashboard cards). */
export const NoteSummary = z.object({
  id: Uuid,
  userId: Uuid,
  folderId: Uuid.nullable(),
  title: z.string(),
  excerpt: z.string(),
  status: NoteStatus,
  hasRecording: z.boolean(),
  tags: z.array(Tag),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type NoteSummary = z.infer<typeof NoteSummary>;

/** A note in full detail (note view). Original content is never overwritten by AI. */
export const Note = NoteSummary.extend({
  originalContent: z.string(),
  recording: Recording.nullable().optional(),
  transcript: Transcript.nullable().optional(),
  enhancedVersions: z.array(EnhancedNoteVersion).default([]),
});
export type Note = z.infer<typeof Note>;

export const CreateNoteInput = z.object({
  title: z.string().trim().max(200).default(''),
  originalContent: z.string().default(''),
  folderId: Uuid.nullable().optional(),
  tagNames: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  /** Opt in to AI-suggested folder + tags during processing. */
  autoOrganise: z.boolean().optional(),
});
export type CreateNoteInput = z.infer<typeof CreateNoteInput>;

/** Autosave/update. All fields optional so drafts can be saved incrementally. */
export const UpdateNoteInput = z.object({
  title: z.string().trim().max(200).optional(),
  originalContent: z.string().optional(),
  folderId: Uuid.nullable().optional(),
  tagNames: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  autoOrganise: z.boolean().optional(),
});
export type UpdateNoteInput = z.infer<typeof UpdateNoteInput>;

/** Dashboard list / search query. */
export const ListNotesQuery = z.object({
  q: z.string().trim().max(200).optional(),
  folderId: Uuid.optional(),
  tag: z.string().trim().optional(),
  hasRecording: z.coerce.boolean().optional(),
  from: IsoDate.optional(),
  to: IsoDate.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListNotesQuery = z.infer<typeof ListNotesQuery>;
