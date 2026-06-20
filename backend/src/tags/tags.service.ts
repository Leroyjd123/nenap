import { Injectable } from '@nestjs/common';
import type { Tag } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../auth/auth-user';
import { toTag } from '../common/mappers';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(user: AuthUser): Promise<Tag[]> {
    const tags = await this.prisma.tag.findMany({
      where: { userId: user.id },
      orderBy: { name: 'asc' },
    });
    return tags.map(toTag);
  }
}
