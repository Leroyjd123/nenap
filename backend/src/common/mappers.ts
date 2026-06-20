import type {
  Folder as PrismaFolder,
  Tag as PrismaTag,
  Note as PrismaNote,
  Recording as PrismaRecording,
  Transcript as PrismaTranscript,
  EnhancedNoteVersion as PrismaEnhanced,
} from '@prisma/client';
import type {
  Folder,
  Tag,
  Note,
  NoteSummary,
  Recording,
  Transcript,
  EnhancedNoteVersion,
} from '@nenap/types';

const iso = (d: Date): string => d.toISOString();

/** Strip HTML tags + markdown to a short plain-text preview for cards. */
export function toExcerpt(content: string, max = 160): string {
  const plain = content
    .replace(/<[^>]*>/g, ' ') // HTML tags (Tiptap output)
    .replace(/[#*_`>~-]/g, ' ') // markdown markers
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}

export function toTag(t: PrismaTag): Tag {
  return { id: t.id, userId: t.userId, name: t.name, createdAt: iso(t.createdAt) };
}

export function toFolder(f: PrismaFolder, noteCount?: number): Folder {
  return {
    id: f.id,
    userId: f.userId,
    name: f.name,
    noteCount,
    createdAt: iso(f.createdAt),
    updatedAt: iso(f.updatedAt),
  };
}

export function toRecording(r: PrismaRecording): Recording {
  return {
    id: r.id,
    noteId: r.noteId,
    userId: r.userId,
    storagePath: r.storagePath,
    mimeType: r.mimeType,
    durationSec: r.durationSec,
    sizeBytes: r.sizeBytes,
    createdAt: iso(r.createdAt),
  };
}

export function toTranscript(t: PrismaTranscript): Transcript {
  return { id: t.id, noteId: t.noteId, content: t.content, source: t.source, createdAt: iso(t.createdAt) };
}

export function toEnhanced(e: PrismaEnhanced): EnhancedNoteVersion {
  return { id: e.id, noteId: e.noteId, version: e.version, content: e.content, createdAt: iso(e.createdAt) };
}

type NoteWithRelations = PrismaNote & {
  tags?: PrismaTag[];
  recording?: PrismaRecording | null;
  transcript?: PrismaTranscript | null;
  enhancedVersions?: PrismaEnhanced[];
};

export function toNoteSummary(n: NoteWithRelations): NoteSummary {
  return {
    id: n.id,
    userId: n.userId,
    folderId: n.folderId,
    title: n.title,
    excerpt: toExcerpt(n.originalContent),
    status: n.status,
    hasRecording: !!n.recording,
    tags: (n.tags ?? []).map(toTag),
    createdAt: iso(n.createdAt),
    updatedAt: iso(n.updatedAt),
  };
}

export function toNote(n: NoteWithRelations): Note {
  return {
    ...toNoteSummary(n),
    originalContent: n.originalContent,
    recording: n.recording ? toRecording(n.recording) : null,
    transcript: n.transcript ? toTranscript(n.transcript) : null,
    enhancedVersions: (n.enhancedVersions ?? []).map(toEnhanced),
  };
}
