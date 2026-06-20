import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CompleteRecordingInput,
  Recording,
  SignedUploadResponse,
  SignRecordingInput,
} from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
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
  ) {}

  /**
   * Step 1 — create (or replace) the Recording row for a note and return a signed
   * upload slot. One recording per note: re-recording replaces the previous file.
   */
  async sign(user: AuthUser, noteId: string, input: SignRecordingInput): Promise<SignedUploadResponse> {
    await this.assertNoteOwned(user, noteId);

    const ext = EXT[input.mimeType] ?? 'webm';
    // Stable, owner-scoped path; a timestamp-free name keeps one file per note.
    const path = `${user.id}/${noteId}.${ext}`;

    const existing = await this.prisma.recording.findUnique({ where: { noteId } });
    if (existing && existing.storagePath !== path) {
      await this.storage.remove(existing.storagePath);
    }

    const signed = await this.storage.createSignedUpload(path);

    const recording = await this.prisma.recording.upsert({
      where: { noteId },
      update: { storagePath: path, mimeType: input.mimeType },
      create: { noteId, userId: user.id, storagePath: path, mimeType: input.mimeType },
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

    return toRecording(updated);
  }

  private async assertNoteOwned(user: AuthUser, noteId: string): Promise<void> {
    const note = await this.prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== user.id) throw new ForbiddenException();
  }
}
