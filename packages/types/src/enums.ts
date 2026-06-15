import { z } from 'zod';

/** Lifecycle of a note. notes-only go draft→completed; recorded notes pass through processing. */
export const NoteStatus = z.enum(['draft', 'processing', 'completed', 'failed']);
export type NoteStatus = z.infer<typeof NoteStatus>;

/** Lifecycle of a background processing job. */
export const JobStatus = z.enum(['queued', 'processing', 'completed', 'failed']);
export type JobStatus = z.infer<typeof JobStatus>;

/** What a processing job does. The MVP pipeline runs transcribe → enhance. */
export const JobType = z.enum(['transcribe', 'enhance']);
export type JobType = z.infer<typeof JobType>;

/** Source that produced a transcript. */
export const TranscriptSource = z.enum(['gemini', 'web_speech', 'upload']);
export type TranscriptSource = z.infer<typeof TranscriptSource>;
