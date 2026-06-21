import { Injectable, Logger } from '@nestjs/common';
import type { AccountStats } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { AuthUser } from '../auth/auth-user';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Ensures a local User row exists for the authenticated principal. Supabase owns
   * identity/passwords; our table is a profile mirror that foreign keys hang off.
   * Called lazily on first write.
   *
   * Self-healing: if a stale row holds this email under a *different* id (e.g. an
   * auth user was recreated), we remove the stale row before creating the current
   * one — avoiding the unique-email collision that would otherwise 500.
   */
  async ensureUser(user: AuthUser): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (existing) return;

    const email = user.email || `${user.id}@placeholder.local`;

    const emailOwner = await this.prisma.user.findUnique({ where: { email } });
    if (emailOwner && emailOwner.id !== user.id) {
      this.logger.warn(`Reclaiming email ${email} from stale user ${emailOwner.id} → ${user.id}`);
      await this.prisma.user.delete({ where: { id: emailOwner.id } });
    }

    await this.prisma.user.create({ data: { id: user.id, email } });
  }

  /** Lifetime usage counters for the account page. */
  async stats(userId: string): Promise<AccountStats> {
    const [notes, recordings, transcripts, enhancedVersions, attachments, folders, tags, recSize, attSize] =
      await Promise.all([
        this.prisma.note.count({ where: { userId } }),
        this.prisma.recording.count({ where: { userId } }),
        this.prisma.transcript.count({ where: { note: { userId } } }),
        this.prisma.enhancedNoteVersion.count({ where: { note: { userId } } }),
        this.prisma.attachment.count({ where: { userId } }),
        this.prisma.folder.count({ where: { userId } }),
        this.prisma.tag.count({ where: { userId } }),
        this.prisma.recording.aggregate({ where: { userId }, _sum: { sizeBytes: true } }),
        this.prisma.attachment.aggregate({ where: { userId }, _sum: { sizeBytes: true } }),
      ]);

    return {
      notes,
      recordings,
      transcripts,
      enhancedVersions,
      attachments,
      folders,
      tags,
      storageBytes: (recSize._sum.sizeBytes ?? 0) + (attSize._sum.sizeBytes ?? 0),
    };
  }

  /**
   * Permanently deletes the account: removes stored files, the DB row (which cascades
   * all notes/folders/tags/recordings/attachments/jobs), and the Supabase auth user.
   */
  async deleteAccount(user: AuthUser): Promise<void> {
    const [recordings, attachments] = await Promise.all([
      this.prisma.recording.findMany({ where: { userId: user.id }, select: { storagePath: true } }),
      this.prisma.attachment.findMany({ where: { userId: user.id }, select: { storagePath: true } }),
    ]);

    await this.storage.removeMany(recordings.map((r) => r.storagePath));
    await this.storage.removeMany(attachments.map((a) => a.storagePath), 'attachments');

    await this.prisma.user.deleteMany({ where: { id: user.id } }); // cascades app data
    await this.storage.deleteAuthUser(user.id);
    this.logger.warn(`Account deleted: ${user.id}`);
  }
}
