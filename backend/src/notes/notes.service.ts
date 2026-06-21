import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type {
  CreateNoteInput,
  ListNotesQuery,
  Note,
  NoteSummary,
  UpdateNoteInput,
} from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { StorageService } from '../storage/storage.service';
import type { AuthUser } from '../auth/auth-user';
import { toNote, toNoteSummary } from '../common/mappers';

const DETAIL_INCLUDE = {
  tags: true,
  recordings: { orderBy: { createdAt: 'asc' } },
  transcripts: { orderBy: { createdAt: 'asc' } },
  enhancedVersions: { orderBy: { version: 'desc' } },
  attachments: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.NoteInclude;

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly storage: StorageService,
  ) {}

  async list(user: AuthUser, query: ListNotesQuery): Promise<NoteSummary[]> {
    const where: Prisma.NoteWhereInput = { userId: user.id };

    if (query.folderId) where.folderId = query.folderId;
    if (query.hasRecording === true) where.recordings = { some: {} };
    if (query.hasRecording === false) where.recordings = { none: {} };
    if (query.tag) where.tags = { some: { name: query.tag } };
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }
    if (query.q) {
      // Substring match across everything a user might search by. (A Postgres
      // tsvector full-text index is the planned performance upgrade.)
      const q = query.q;
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { originalContent: { contains: q, mode: 'insensitive' } },
        { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
        { transcripts: { some: { content: { contains: q, mode: 'insensitive' } } } },
        { enhancedVersions: { some: { content: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const notes = await this.prisma.note.findMany({
      where,
      include: { tags: true, _count: { select: { recordings: true } } },
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
    return notes.map(toNoteSummary);
  }

  async get(user: AuthUser, id: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({ where: { id }, include: DETAIL_INCLUDE });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== user.id) throw new ForbiddenException();
    const mapped = toNote(note);
    // Attach short-lived signed playback URLs for each recording.
    mapped.recordings = await Promise.all(
      mapped.recordings.map(async (r) => ({ ...r, url: await this.storage.createSignedDownloadUrl(r.storagePath) })),
    );
    return mapped;
  }

  async create(user: AuthUser, input: CreateNoteInput): Promise<Note> {
    await this.users.ensureUser(user);
    if (input.folderId) await this.assertFolderOwned(user, input.folderId);

    const note = await this.prisma.note.create({
      data: {
        userId: user.id,
        title: input.title ?? '',
        originalContent: input.originalContent ?? '',
        folderId: input.folderId ?? null,
        autoOrganise: input.autoOrganise ?? false,
        tags: input.tagNames?.length ? this.connectOrCreateTags(user, input.tagNames) : undefined,
      },
      include: DETAIL_INCLUDE,
    });
    return toNote(note);
  }

  async update(user: AuthUser, id: string, input: UpdateNoteInput): Promise<Note> {
    await this.assertNoteOwned(user, id);
    if (input.folderId) await this.assertFolderOwned(user, input.folderId);

    const data: Prisma.NoteUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.originalContent !== undefined) data.originalContent = input.originalContent;
    if (input.autoOrganise !== undefined) data.autoOrganise = input.autoOrganise;
    if (input.folderId !== undefined) {
      data.folder = input.folderId ? { connect: { id: input.folderId } } : { disconnect: true };
    }
    if (input.tagNames !== undefined) {
      // `set: []` clears the join, then connect/create reattaches the new set.
      data.tags = { set: [], ...this.connectOrCreateTags(user, input.tagNames) };
    }

    const note = await this.prisma.note.update({ where: { id }, data, include: DETAIL_INCLUDE });
    return toNote(note);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.assertNoteOwned(user, id);
    // Storage isn't cascade-linked to the DB, so remove the files first — before the
    // rows (and their storagePaths) are gone. remove() is best-effort.
    const recordings = await this.prisma.recording.findMany({
      where: { noteId: id },
      select: { storagePath: true },
    });
    await Promise.all(recordings.map((r) => this.storage.remove(r.storagePath)));

    const attachments = await this.prisma.attachment.findMany({
      where: { noteId: id },
      select: { storagePath: true },
    });
    await Promise.all(attachments.map((a) => this.storage.remove(a.storagePath, 'attachments')));

    // Cascades remove recording, transcript, enhanced versions, jobs, and attachments.
    await this.prisma.note.delete({ where: { id } });
  }

  // --- helpers ---

  private connectOrCreateTags(user: AuthUser, names: string[]): Prisma.TagUpdateManyWithoutNotesNestedInput {
    const unique = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
    return {
      connectOrCreate: unique.map((name) => ({
        where: { userId_name: { userId: user.id, name } },
        create: { userId: user.id, name },
      })),
    };
  }

  private async assertNoteOwned(user: AuthUser, id: string): Promise<void> {
    const note = await this.prisma.note.findUnique({ where: { id }, select: { userId: true } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== user.id) throw new ForbiddenException();
  }

  private async assertFolderOwned(user: AuthUser, folderId: string): Promise<void> {
    const folder = await this.prisma.folder.findUnique({
      where: { id: folderId },
      select: { userId: true },
    });
    if (!folder || folder.userId !== user.id) throw new NotFoundException('Folder not found');
  }
}
