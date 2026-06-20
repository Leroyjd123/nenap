import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth-user';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

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
}
