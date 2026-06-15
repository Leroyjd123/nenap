import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateFolderInput, Folder, UpdateFolderInput } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { AuthUser } from '../auth/auth-user';
import { toFolder } from '../common/mappers';

@Injectable()
export class FoldersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async list(user: AuthUser): Promise<Folder[]> {
    const folders = await this.prisma.folder.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
      include: { _count: { select: { notes: true } } },
    });
    return folders.map((f) => toFolder(f, f._count.notes));
  }

  async create(user: AuthUser, input: CreateFolderInput): Promise<Folder> {
    await this.users.ensureUser(user);
    const folder = await this.prisma.folder.create({
      data: { userId: user.id, name: input.name },
    });
    return toFolder(folder, 0);
  }

  async update(user: AuthUser, id: string, input: UpdateFolderInput): Promise<Folder> {
    await this.assertOwned(user, id);
    const folder = await this.prisma.folder.update({
      where: { id },
      data: { name: input.name },
    });
    return toFolder(folder);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    await this.assertOwned(user, id);
    // Notes keep existing; their folderId is set null by the FK onDelete rule.
    await this.prisma.folder.delete({ where: { id } });
  }

  /** Ownership guard — never trust a client-supplied id without checking userId. */
  private async assertOwned(user: AuthUser, id: string): Promise<void> {
    const folder = await this.prisma.folder.findUnique({ where: { id } });
    if (!folder || folder.userId !== user.id) {
      throw new NotFoundException('Folder not found');
    }
  }
}
