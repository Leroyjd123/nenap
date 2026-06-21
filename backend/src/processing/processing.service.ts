import { ForbiddenException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import type { JobType, Prisma, ProcessingJob } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { GeminiService } from '../gemini/gemini.service';
import { EntitlementsService } from '../billing/entitlements.service';
import type { AuthUser } from '../auth/auth-user';

const STUCK_AFTER_MS = 3 * 60 * 1000; // re-queue jobs stuck 'processing' this long

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);
  private readonly inFlight = new Set<string>(); // guards against double-running a job

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly gemini: GeminiService,
    private readonly entitlements: EntitlementsService,
  ) {}

  /** Fire-and-forget kick after a recording is saved or "Improve again" is tapped. */
  kickoff(noteId: string): void {
    void this.runQueuedForNote(noteId).catch((e) =>
      this.logger.error(`kickoff failed for note ${noteId}: ${(e as Error).message}`),
    );
  }

  /** "Improve again" — queue an enhance-only job and run it now. */
  async improve(user: AuthUser, noteId: string): Promise<void> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true, _count: { select: { enhancedVersions: true } } },
    });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== user.id) throw new ForbiddenException();

    // Re-running on a note that already has an enhanced version is "Improve again"
    // (a paid feature). The first enhancement / retrying a failed one stays free.
    const isRegen = note._count.enhancedVersions > 0;
    if (isRegen && !(await this.entitlements.canImproveAgain(user.id))) {
      throw new HttpException(
        { message: '“Improve again” is available on Basic and Pro. Upgrade or grab a booster.', code: 'IMPROVE_LIMIT' },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    await this.prisma.note.update({ where: { id: noteId }, data: { status: 'processing' } });
    await this.prisma.processingJob.create({ data: { noteId, type: 'enhance', status: 'queued' } });
    this.kickoff(noteId);
  }

  private async runQueuedForNote(noteId: string): Promise<void> {
    const job = await this.prisma.processingJob.findFirst({
      where: { noteId, status: 'queued' },
      orderBy: { createdAt: 'asc' },
    });
    if (job) await this.runJob(job);
  }

  /** Periodic sweep: pick up queued jobs and re-queue stuck ones. */
  @Interval(15000)
  async sweep(): Promise<void> {
    const stuckBefore = new Date(Date.now() - STUCK_AFTER_MS);
    const jobs = await this.prisma.processingJob.findMany({
      where: {
        OR: [{ status: 'queued' }, { status: 'processing', updatedAt: { lt: stuckBefore } }],
      },
      orderBy: { createdAt: 'asc' },
      take: 5,
    });
    for (const job of jobs) {
      await this.runJob(job).catch((e) =>
        this.logger.error(`sweep job ${job.id} failed: ${(e as Error).message}`),
      );
    }
  }

  /** Runs a single job: transcribe (if audio) + enhance, with retry/backoff semantics. */
  private async runJob(job: ProcessingJob): Promise<void> {
    if (this.inFlight.has(job.id)) return;
    this.inFlight.add(job.id);
    try {
      await this.prisma.processingJob.update({
        where: { id: job.id },
        data: { status: 'processing', attempts: { increment: 1 }, startedAt: new Date(), error: null },
      });

      await this.execute(job.noteId, job.type);

      await this.prisma.$transaction([
        this.prisma.processingJob.update({
          where: { id: job.id },
          data: { status: 'completed', finishedAt: new Date() },
        }),
        this.prisma.note.update({ where: { id: job.noteId }, data: { status: 'completed' } }),
      ]);
    } catch (err) {
      const message = (err as Error).message ?? 'Processing failed';
      const attempts = job.attempts + 1;
      const willRetry = attempts < job.maxAttempts;
      this.logger.warn(`job ${job.id} (${job.type}) failed [${attempts}/${job.maxAttempts}]: ${message}`);
      await this.prisma.processingJob.update({
        where: { id: job.id },
        data: { status: willRetry ? 'queued' : 'failed', error: message, finishedAt: willRetry ? null : new Date() },
      });
      if (!willRetry) {
        await this.prisma.note.update({ where: { id: job.noteId }, data: { status: 'failed' } });
      }
    } finally {
      this.inFlight.delete(job.id);
    }
  }

  /** The actual work: produce a transcript (when audio exists) and an enhanced version. */
  private async execute(noteId: string, type: JobType): Promise<void> {
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { recording: true, transcript: true },
    });
    if (!note) throw new NotFoundException('Note no longer exists');

    let transcriptText = note.transcript?.content ?? '';

    if (type === 'transcribe' && note.recording) {
      const blob = await this.storage.downloadFile(note.recording.storagePath);
      transcriptText = await this.gemini.transcribe(blob, note.recording.mimeType);
      await this.prisma.transcript.upsert({
        where: { noteId },
        update: { content: transcriptText, source: 'gemini' },
        create: { noteId, content: transcriptText, source: 'gemini' },
      });
    }

    const enhanced = await this.gemini.enhance(note.originalContent, transcriptText);

    const last = await this.prisma.enhancedNoteVersion.findFirst({
      where: { noteId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    await this.prisma.enhancedNoteVersion.create({
      data: { noteId, version: (last?.version ?? 0) + 1, content: enhanced },
    });

    // Opt-in: let the AI suggest a folder + tags. Best-effort, never fails the job.
    if (note.autoOrganise) {
      await this.autoOrganise(note.id, note.userId, note.folderId, note.originalContent, transcriptText, enhanced);
    }
  }

  /** Applies AI-suggested folder (only if none set) and merges suggested tags. */
  private async autoOrganise(
    noteId: string,
    userId: string,
    currentFolderId: string | null,
    original: string,
    transcript: string,
    enhanced: string,
  ): Promise<void> {
    try {
      const { folder, tags } = await this.gemini.organise(original, transcript, enhanced);
      const data: Prisma.NoteUpdateInput = {};
      if (folder && !currentFolderId) {
        data.folder = {
          connectOrCreate: {
            where: { userId_name: { userId, name: folder } },
            create: { userId, name: folder },
          },
        };
      }
      if (tags.length) {
        data.tags = {
          connectOrCreate: tags.map((name) => ({
            where: { userId_name: { userId, name } },
            create: { userId, name },
          })),
        };
      }
      if (Object.keys(data).length) {
        await this.prisma.note.update({ where: { id: noteId }, data });
      }
    } catch (e) {
      this.logger.warn(`auto-organise failed for note ${noteId}: ${(e as Error).message}`);
    }
  }
}
