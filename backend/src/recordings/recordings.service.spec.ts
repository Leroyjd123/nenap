import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordingsService } from './recordings.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';
import type { ProcessingService } from '../processing/processing.service';
import type { AuthUser } from '../auth/auth-user';

const USER: AuthUser = { id: 'user-1', email: 'a@b.com' };

function makeService() {
  const prisma = {
    note: { findUnique: vi.fn(), update: vi.fn() },
    recording: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    processingJob: { create: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const storage = {
    createSignedUpload: vi.fn().mockResolvedValue({ path: 'p', token: 't', signedUrl: 'https://x/u' }),
    remove: vi.fn(),
  };
  const processing = { kickoff: vi.fn() };
  const service = new RecordingsService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    processing as unknown as ProcessingService,
  );
  return { service, prisma, storage, processing };
}

describe('RecordingsService.sign', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => (ctx = makeService()));

  it('rejects a note the user does not own', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue({ userId: 'someone-else' });
    await expect(ctx.service.sign(USER, 'note-1', { mimeType: 'audio/webm' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('issues a signed upload and upserts the recording at an owner-scoped path', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue({ userId: USER.id });
    ctx.prisma.recording.findUnique.mockResolvedValue(null);
    ctx.prisma.recording.upsert.mockResolvedValue({ id: 'rec-1' });

    const res = await ctx.service.sign(USER, 'note-1', { mimeType: 'audio/webm' });

    expect(res.recordingId).toBe('rec-1');
    expect(ctx.storage.createSignedUpload).toHaveBeenCalledWith('user-1/note-1.webm');
  });
});

describe('RecordingsService.complete', () => {
  it('queues a transcribe job and flips the note to processing', async () => {
    const ctx = makeService();
    ctx.prisma.note.findUnique.mockResolvedValue({ userId: USER.id });
    ctx.prisma.recording.findUnique.mockResolvedValue({ id: 'rec-1', noteId: 'note-1', userId: USER.id });
    ctx.prisma.recording.update.mockResolvedValue({
      id: 'rec-1', noteId: 'note-1', userId: USER.id, storagePath: 'p', mimeType: 'audio/webm',
      durationSec: 12, sizeBytes: 99, createdAt: new Date('2026-01-01T00:00:00Z'),
    });
    ctx.prisma.note.update.mockResolvedValue({});
    ctx.prisma.processingJob.create.mockResolvedValue({});

    const rec = await ctx.service.complete(USER, 'note-1', { recordingId: 'rec-1', durationSec: 12, sizeBytes: 99 });

    expect(rec.durationSec).toBe(12);
    expect(ctx.prisma.note.update).toHaveBeenCalledWith({ where: { id: 'note-1' }, data: { status: 'processing' } });
    expect(ctx.prisma.processingJob.create).toHaveBeenCalled();
  });

  it('rejects a recording that belongs to another note', async () => {
    const ctx = makeService();
    ctx.prisma.note.findUnique.mockResolvedValue({ userId: USER.id });
    ctx.prisma.recording.findUnique.mockResolvedValue({ id: 'rec-1', noteId: 'other', userId: USER.id });
    await expect(
      ctx.service.complete(USER, 'note-1', { recordingId: 'rec-1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
