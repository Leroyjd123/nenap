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
import type { AuthUser } from '../auth/auth-user';
import { toNote, toNoteSummary } from '../common/mappers';

const DETAIL_INCLUDE = {
  tags: true,
  recording: true,
  transcript: true,
  enhancedVersions: { orderBy: { version: 'desc' } },
} satisfies Prisma.NoteInclude;

@Injectable()
export class NotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async list(user: AuthUser, query: ListNotesQuery): Promise<NoteSummary[]> {
    const where: Prisma.NoteWhereInput = { userId: user.id };

    if (query.folderId) where.folderId = query.folderId;
    if (query.hasRecording === true) where.recording = { isNot: null };
    if (query.hasRecording === false) where.recording = { is: null };
    if (query.tag) where.tags = { some: { name: query.tag } };
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(query.to) } : {}),
      };
    }
    if (query.q) {
      // Phase 2: title/content contains. Postgres full-text search lands in Phase 5.
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { originalContent: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const notes = await this.prisma.note.findMany({
      where,
      include: { tags: true, recording: true },
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
    return toNote(note);
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
    // Cascades remove recording, transcript, enhanced versions, and jobs.
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
