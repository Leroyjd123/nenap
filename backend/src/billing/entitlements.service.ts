import { Injectable } from '@nestjs/common';
import type { Plan as PlanType } from '@prisma/client';
import type { Entitlements, TierLimits } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';

/** Capability limits per tier. `recordingsPerDay: null` = unlimited. */
const LIMITS: Record<PlanType, TierLimits> = {
  free: { recordingsPerDay: 1, maxRecordingSec: 300, improveAgain: false, fileUploads: false, maxPhotosPerNote: 3, storageMb: 100 },
  basic: { recordingsPerDay: 10, maxRecordingSec: 1800, improveAgain: true, fileUploads: true, maxPhotosPerNote: 20, storageMb: 2048 },
  pro: { recordingsPerDay: null, maxRecordingSec: 3600, improveAgain: true, fileUploads: true, maxPhotosPerNote: 100, storageMb: 20480 },
};

const RANK: Record<PlanType, number> = { free: 0, basic: 1, pro: 2 };

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolves the user's effective tier (max of subscription + any active pass). */
  async resolve(userId: string): Promise<Entitlements> {
    const now = new Date();
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const plan: PlanType = user?.plan ?? 'free';

    const pass = await this.prisma.userPass.findFirst({
      where: { userId, expiresAt: { gt: now } },
      orderBy: { expiresAt: 'desc' },
    });

    let tier: PlanType = plan;
    let activePass: Entitlements['activePass'] = null;
    if (pass && RANK[pass.level] > RANK[tier]) {
      tier = pass.level;
    }
    if (pass) {
      activePass = { level: pass.level, expiresAt: pass.expiresAt.toISOString() };
    }

    return {
      plan,
      tier,
      limits: LIMITS[tier],
      usage: { recordingsToday: await this.recordingsToday(userId) },
      activePass,
    };
  }

  /** Count of recordings the user created since UTC midnight today. */
  async recordingsToday(userId: string): Promise<number> {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    return this.prisma.recording.count({
      where: { note: { userId }, createdAt: { gte: start } },
    });
  }

  /** Throws nothing — callers use these to decide whether to allow an action. */
  async canRecord(userId: string): Promise<boolean> {
    const { limits } = await this.resolve(userId);
    if (limits.recordingsPerDay === null) return true;
    return (await this.recordingsToday(userId)) < limits.recordingsPerDay;
  }

  async canImproveAgain(userId: string): Promise<boolean> {
    const { limits } = await this.resolve(userId);
    return limits.improveAgain;
  }
}
