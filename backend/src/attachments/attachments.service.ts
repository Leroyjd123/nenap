import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Attachment, CreateAttachmentInput, SignAttachmentInput, SignedAttachmentResponse } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { EntitlementsService } from '../billing/entitlements.service';
import { toAttachment } from '../common/mappers';
import type { AuthUser } from '../auth/auth-user';

const BUCKET = 'attachments';

// Server-side allowlists — never trust the client's claimed type.
const IMAGE_MIME = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/heic', 'image/heif']);
const FILE_MIME = new Set([
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB

function paymentRequired(message: string, code: string): never {
  throw new HttpException({ message, code }, HttpStatus.PAYMENT_REQUIRED);
}

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly entitlements: EntitlementsService,
  ) {}

  /** Step 1 — enforce plan limits, then return a signed upload slot. No row yet. */
  async sign(user: AuthUser, noteId: string, input: SignAttachmentInput): Promise<SignedAttachmentResponse> {
    await this.assertNoteOwned(user, noteId);

    // Validate type + size by kind before anything else.
    if (input.kind === 'image') {
      if (!IMAGE_MIME.has(input.mimeType)) throw new BadRequestException('Unsupported image type');
      if (input.sizeBytes > MAX_IMAGE_BYTES) throw new BadRequestException('Image is too large (max 10 MB)');
    } else {
      if (!FILE_MIME.has(input.mimeType)) throw new BadRequestException('Unsupported file type');
      if (input.sizeBytes > MAX_FILE_BYTES) throw new BadRequestException('File is too large (max 25 MB)');
    }

    const { limits } = await this.entitlements.resolve(user.id);

    if (input.kind === 'file' && !limits.fileUploads) {
      paymentRequired('File uploads are available on Basic and Pro. Upgrade or grab a booster.', 'FILE_UPLOADS');
    }
    if (input.kind === 'image') {
      const photos = await this.prisma.attachment.count({ where: { noteId, kind: 'image' } });
      if (photos >= limits.maxPhotosPerNote) {
        paymentRequired(`You can add up to ${limits.maxPhotosPerNote} photos per note on your plan.`, 'PHOTO_LIMIT');
      }
    }
    const used = await this.storageUsedBytes(user.id);
    if (used + input.sizeBytes > limits.storageMb * 1024 * 1024) {
      paymentRequired('You’ve reached your storage limit. Upgrade for more space.', 'STORAGE_LIMIT');
    }

    const attachmentId = randomUUID();
    const ext = this.ext(input.name, input.mimeType);
    const storagePath = `${user.id}/${noteId}/${attachmentId}${ext ? `.${ext}` : ''}`;
    const signed = await this.storage.createSignedUpload(storagePath, BUCKET);
    return { attachmentId, storagePath: signed.path, token: signed.token, signedUrl: signed.signedUrl };
  }

  /** Step 2 — after the browser uploads, persist the attachment row. */
  async create(user: AuthUser, noteId: string, input: CreateAttachmentInput): Promise<Attachment> {
    await this.assertNoteOwned(user, noteId);
    const created = await this.prisma.attachment.create({
      data: {
        id: input.attachmentId,
        noteId,
        userId: user.id,
        kind: input.kind,
        storagePath: input.storagePath,
        mimeType: input.mimeType,
        name: input.name,
        sizeBytes: input.sizeBytes,
      },
    });
    return toAttachment(created);
  }

  /** Attachments for a note, each with a short-lived signed URL for display/download. */
  async list(user: AuthUser, noteId: string): Promise<Attachment[]> {
    await this.assertNoteOwned(user, noteId);
    const rows = await this.prisma.attachment.findMany({ where: { noteId }, orderBy: { createdAt: 'asc' } });
    return Promise.all(
      rows.map(async (a) => ({
        ...toAttachment(a),
        url: await this.storage.createSignedDownloadUrl(a.storagePath, 3600, BUCKET),
      })),
    );
  }

  async remove(user: AuthUser, noteId: string, attachmentId: string): Promise<void> {
    await this.assertNoteOwned(user, noteId);
    const a = await this.prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!a || a.noteId !== noteId || a.userId !== user.id) throw new NotFoundException('Attachment not found');
    await this.storage.remove(a.storagePath, BUCKET);
    await this.prisma.attachment.delete({ where: { id: attachmentId } });
  }

  private async storageUsedBytes(userId: string): Promise<number> {
    const agg = await this.prisma.attachment.aggregate({ where: { userId }, _sum: { sizeBytes: true } });
    return agg._sum.sizeBytes ?? 0;
  }

  private ext(name: string, mimeType: string): string {
    const fromName = name.includes('.') ? name.split('.').pop()! : '';
    if (fromName && fromName.length <= 5) return fromName.toLowerCase();
    return mimeType.split('/')[1]?.split(';')[0] ?? '';
  }

  private async assertNoteOwned(user: AuthUser, noteId: string): Promise<void> {
    const note = await this.prisma.note.findUnique({ where: { id: noteId }, select: { userId: true } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.userId !== user.id) throw new ForbiddenException();
  }
}
