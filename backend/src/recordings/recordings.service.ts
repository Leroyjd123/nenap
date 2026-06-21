import { randomUUID } from 'node:crypto';
import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CompleteRecordingInput,
  Recording,
  SignedUploadResponse,
  SignRecordingInput,
} from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ProcessingService } from '../processing/processing.service';
import { EntitlementsService } from '../billing/entitlements.service';
import { toRecording } from '../common/mappers';
import type { AuthUser } from '../auth/auth-user';

const EXT: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
};

@Injectable()
export class RecordingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly processing: ProcessingService,
    private readonly entitlements: EntitlementsService,
  ) {}

  /**
   * Step 1 — create (or replace) the Recording row for a note and return a signed
   * upload slot. One recording per note: re-recording replaces the previous file.
   */
  async sign(user: AuthUser, noteId: string, input: SignRecordingInput): Promise<SignedUploadResponse> {
    await this.assertNoteOwned(user, noteId);

    // A note can hold several clips, so every clip is new and counts toward the cap.
    if (!(await this.entitlements.canRecord(user.id))) {
      throw new HttpException(
        { message: 'You’ve used your recording for today. Upgrade your plan or grab a booster for more.', code: 'RECORDING_LIMIT' },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const ext = EXT[input.mimeType] ?? 'webm';
    const recordingId = randomUUID();
    // Per-clip path keeps clips from overwriting each other.
    const path = `${user.id}/${noteId}/${recordingId}.${ext}`;
    const signed = await this.storage.createSignedUpload(path);

    const recording = await this.prisma.recording.create({
      data: { id: recordingId, noteId, userId: user.id, storagePath: path, mimeType: input.mimeType },
    });

    return { recordingId: recording.id, path: signed.path, token: signed.token, signedUrl: signed.signedUrl };
  }

  /**
   * Step 2 — after the browser uploads, persist duration/size, flip the note to
   * `processing`, and queue a transcription job (Gemini runs in Phase 4).
   */
  async complete(user: AuthUser, noteId: string, input: CompleteRecordingInput): Promise<Recording> {
    await this.assertNoteOwned(user, noteId);
    const recording = await this.prisma.recording.findUnique({ where: { id: input.recordingId } });
    if (!recording || recording.noteId !== noteId || recording.userId !== user.id) {
      throw new NotFoundException('Recording not found');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.recording.update({
        where: { id: recording.id },
        data: { durationSec: input.durationSec ?? null, sizeBytes: input.sizeBytes ?? null },
      }),
      this.prisma.note.update({ where: { id: noteId }, data: { status: 'processing' } }),
      this.prisma.processingJob.create({
        data: { noteId, recordingId: recording.id, type: 'transcribe', status: 'queued' },
      }),
    ]);

    this.processing.kickoff(noteId); // start transcribe + enhance now (sweep is the backstop)
    return toRecording(updated);
  }

  /** Signed URL for the note's most recent recording (note detail carries all clips' URLs). */
  async getPlaybackUrl(user: AuthUser, noteId: string): Promise<{ url: string | null }> {
    await this.assertNoteOwned(user, noteId);
    const recording = await this.prisma.recording.findFirst({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
    });
    if (!recording) return { url: null };
    return { url: await this.storage.createSignedDownloadUrl(recording.storagePath) };
  }

  private async assertNoteOwned(user: AuthUser, noteId: string): Promise<void> {
    const note = await this.prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== user.id) throw new ForbiddenException();
  }
}
