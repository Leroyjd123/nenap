import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProcessingService } from './processing.service';
import type { PrismaService } from '../prisma/prisma.service';
import type { StorageService } from '../storage/storage.service';
import type { GeminiService } from '../gemini/gemini.service';
import type { EntitlementsService } from '../billing/entitlements.service';
import type { AnalyticsService } from '../analytics/analytics.service';
import type { MailService } from '../mail/mail.service';
import type { LangfuseService } from '../langfuse/langfuse.service';

function makeService() {
  const prisma = {
    processingJob: { update: vi.fn().mockResolvedValue({}), findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    note: { findUnique: vi.fn(), update: vi.fn().mockResolvedValue({}) },
    recording: { findUnique: vi.fn() },
    transcript: { upsert: vi.fn().mockResolvedValue({}), findMany: vi.fn().mockResolvedValue([]) },
    enhancedNoteVersion: { findFirst: vi.fn(), create: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  };
  const storage = { downloadFile: vi.fn().mockResolvedValue(new Blob(['x'])) };
  const gemini = {
    transcribe: vi.fn().mockResolvedValue('the transcript'),
    enhance: vi.fn().mockResolvedValue('<h3>Clean</h3>'),
  };
  const service = new ProcessingService(
    prisma as unknown as PrismaService,
    storage as unknown as StorageService,
    gemini as unknown as GeminiService,
    { canImproveAgain: vi.fn().mockResolvedValue(true) } as unknown as EntitlementsService,
    { capture: vi.fn() } as unknown as AnalyticsService,
    { sendProcessingFailed: vi.fn() } as unknown as MailService,
    { trace: vi.fn().mockReturnValue(undefined) } as unknown as LangfuseService,
  );
  return { service, prisma, storage, gemini };
}

const job = (over: Record<string, unknown> = {}) => ({
  id: 'job-1', noteId: 'note-1', recordingId: 'rec-1', type: 'transcribe',
  status: 'queued', attempts: 0, maxAttempts: 3, error: null,
  startedAt: null, finishedAt: null, createdAt: new Date(), updatedAt: new Date(), ...over,
});

// runJob is private; exercise it through the sweep (which calls it).
function runViaSweep(ctx: ReturnType<typeof makeService>, j: Record<string, unknown>) {
  ctx.prisma.processingJob.findMany.mockResolvedValue([j]);
  return ctx.service.sweep();
}

describe('ProcessingService transcribe job', () => {
  let ctx: ReturnType<typeof makeService>;
  beforeEach(() => (ctx = makeService()));

  it('transcribes, saves transcript, creates v1 enhanced, completes', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue({
      id: 'note-1', userId: 'u', folderId: null, originalContent: 'orig', autoOrganise: false,
    });
    ctx.prisma.recording.findUnique.mockResolvedValue({ id: 'rec-1', storagePath: 'p', mimeType: 'audio/webm' });
    ctx.prisma.transcript.findMany.mockResolvedValue([{ content: 'the transcript' }]);
    ctx.prisma.enhancedNoteVersion.findFirst.mockResolvedValue(null);

    await runViaSweep(ctx, job());

    expect(ctx.gemini.transcribe).toHaveBeenCalled();
    expect(ctx.prisma.transcript.upsert).toHaveBeenCalled();
    expect(ctx.prisma.enhancedNoteVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: 1 }) }),
    );
    // final transaction marks job + note completed
    expect(ctx.prisma.$transaction).toHaveBeenCalled();
  });

  it('bumps the enhanced version number on re-enhance', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue({ id: 'note-1', userId: 'u', folderId: null, originalContent: 'orig', autoOrganise: false });
    ctx.prisma.transcript.findMany.mockResolvedValue([{ content: 't' }]);
    ctx.prisma.enhancedNoteVersion.findFirst.mockResolvedValue({ version: 4 });

    await runViaSweep(ctx, job({ type: 'enhance', recordingId: null }));

    expect(ctx.gemini.transcribe).not.toHaveBeenCalled(); // enhance-only path
    expect(ctx.prisma.enhancedNoteVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ version: 5 }) }),
    );
  });

  it('re-queues on failure while attempts remain', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue({ id: 'note-1', userId: 'u', folderId: null, originalContent: 'o', autoOrganise: false });
    ctx.prisma.recording.findUnique.mockResolvedValue({ id: 'rec-1', storagePath: 'p', mimeType: 'audio/webm' });
    ctx.gemini.transcribe.mockRejectedValueOnce(new Error('Gemini is not configured'));

    await runViaSweep(ctx, job({ attempts: 0 }));

    // last update sets status back to queued (retry), not failed
    const calls = ctx.prisma.processingJob.update.mock.calls;
    const last = calls[calls.length - 1]![0];
    expect(last.data.status).toBe('queued');
    expect(ctx.prisma.note.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'failed' } }),
    );
  });

  it('marks failed after the last attempt', async () => {
    ctx.prisma.note.findUnique.mockResolvedValue({ id: 'note-1', userId: 'u', folderId: null, originalContent: 'o', autoOrganise: false });
    ctx.prisma.recording.findUnique.mockResolvedValue({ id: 'rec-1', storagePath: 'p', mimeType: 'audio/webm' });
    ctx.gemini.transcribe.mockRejectedValueOnce(new Error('boom'));

    await runViaSweep(ctx, job({ attempts: 2, maxAttempts: 3 }));

    const calls = ctx.prisma.processingJob.update.mock.calls;
    const last = calls[calls.length - 1]![0];
    expect(last.data.status).toBe('failed');
    expect(ctx.prisma.note.update).toHaveBeenCalledWith({ where: { id: 'note-1' }, data: { status: 'failed' } });
  });
});
