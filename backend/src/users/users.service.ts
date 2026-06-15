import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth-user';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Ensures a local User row exists for the authenticated principal. Supabase owns
   * identity/passwords; our table is a profile mirror that foreign keys hang off.
   * Called lazily on first write so we never depend on a signup webhook.
   */
  async ensureUser(user: AuthUser): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      update: { email: user.email || undefined },
      create: { id: user.id, email: user.email || `${user.id}@placeholder.local` },
    });
  }
}
