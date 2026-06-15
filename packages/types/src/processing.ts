import { z } from 'zod';
import { IsoDate, Uuid } from './common.js';
import { JobStatus, JobType, TranscriptSource } from './enums.js';

export const ProcessingJob = z.object({
  id: Uuid,
  noteId: Uuid,
  recordingId: Uuid.nullable().optional(),
  type: JobType,
  status: JobStatus,
  attempts: z.number().int().min(0),
  maxAttempts: z.number().int().min(1),
  error: z.string().nullable().optional(),
  startedAt: IsoDate.nullable().optional(),
  finishedAt: IsoDate.nullable().optional(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type ProcessingJob = z.infer<typeof ProcessingJob>;

export const Transcript = z.object({
  id: Uuid,
  noteId: Uuid,
  content: z.string(),
  source: TranscriptSource,
  createdAt: IsoDate,
});
export type Transcript = z.infer<typeof Transcript>;

export const EnhancedNoteVersion = z.object({
  id: Uuid,
  noteId: Uuid,
  version: z.number().int().min(1),
  content: z.string(),
  createdAt: IsoDate,
});
export type EnhancedNoteVersion = z.infer<typeof EnhancedNoteVersion>;
