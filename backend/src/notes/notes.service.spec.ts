import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotesService } from './notes.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { UsersService } from '../users/users.service';
import type { AuthUser } from '../auth/auth-user';

const USER: AuthUser = { id: 'user-1', email: 'a@b.com' };
const OTHER = 'user-2';

function makeService() {
  const prisma = {
    note: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    folder: { findUnique: vi.fn() },
  };
  const users = { ensureUser: vi.fn().mockResolvedValue(undefined) };
  const service = new NotesService(
    prisma as unknown as PrismaService,
    users as unknown as UsersService,
  );
  return { service, prisma, users };
}

const dbNote = (over: Record<string, unknown> = {}) => ({
  id: 'note-1',
  userId: USER.id,
  folderId: null,
  title: 'T',
  originalContent: 'hello world',
  status: 'draft',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  tags: [],
  recording: null,
  transcript: null,
  enhancedVersions: [],
  ...over,
});

describe('NotesService.get (ownership)', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => (ctx = makeService()));

  it('returns a mapped note the user owns', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue(dbNote());
    const note = await ctx.service.get(USER, 'note-1');
    expect(note.id).toBe('note-1');
    expect(note.excerpt).toBe('hello world');
    expect(note.createdAt).toBe('2026-01-01T00:00:00.000Z');
  });

  it('throws NotFound when the note is missing', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue(null);
    await expect(ctx.service.get(USER, 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws Forbidden when the note belongs to another user', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue(dbNote({ userId: OTHER }));
    await expect(ctx.service.get(USER, 'note-1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('NotesService.create', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => (ctx = makeService()));

  it('ensures the user row exists and connectOrCreates tags', async () => {
    ctx.prisma.note.create.mockResolvedValue(dbNote({ tags: [{ id: 't1', userId: USER.id, name: 'exam', createdAt: new Date('2026-01-01T00:00:00Z') }] }));
    await ctx.service.create(USER, { title: 'T', originalContent: 'x', tagNames: ['exam', 'exam', ' '] });

    expect(ctx.users.ensureUser).toHaveBeenCalledWith(USER);
    const arg = ctx.prisma.note.create.mock.calls[0]![0];
    // de-duped + trimmed → a single connectOrCreate entry
    expect(arg.data.tags.connectOrCreate).toHaveLength(1);
    expect(arg.data.tags.connectOrCreate[0].create.name).toBe('exam');
  });

  it('rejects a folder the user does not own', async () => {
    ctx.prisma.folder.findUnique.mockResolvedValue({ userId: OTHER });
    await expect(
      ctx.service.create(USER, { title: 'T', originalContent: '', folderId: 'folder-x' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(ctx.prisma.note.create).not.toHaveBeenCalled();
  });
});

describe('NotesService.list (filters)', () => {
  it('translates hasRecording + tag + search into the where clause', async () => {
    const ctx = makeService();
    ctx.prisma.note.findMany.mockResolvedValue([]);
    await ctx.service.list(USER, { hasRecording: true, tag: 'exam', q: 'find', limit: 20, offset: 0 });
    const arg = ctx.prisma.note.findMany.mock.calls[0]![0];
    expect(arg.where.userId).toBe(USER.id);
    expect(arg.where.recording).toEqual({ isNot: null });
    expect(arg.where.tags).toEqual({ some: { name: 'exam' } });
    expect(arg.where.OR).toHaveLength(2);
  });
});
