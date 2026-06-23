import { Injectable } from '@nestjs/common';
import type { Plan as PlanType } from '@prisma/client';
import type { Entitlements, TierLimits } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';

/** Capability limits per tier. `recordingsPerDay: null` = unlimited. */
const LIMITS: Record<PlanType, TierLimits> = {
  free: { recordingsPerDay: 1, maxRecordingSec: 300, improveAgain: false, fileUploads: false, maxPhotosPerNote: 3, storageMb: 100 },
  pro: { recordingsPerDay: 10, maxRecordingSec: 1800, improveAgain: true, fileUploads: true, maxPhotosPerNote: 20, storageMb: 2048 },
  enterprise: { recordingsPerDay: null, maxRecordingSec: 3600, improveAgain: true, fileUploads: true, maxPhotosPerNote: 100, storageMb: 20480 },
};

const RANK: Record<PlanType, number> = { free: 0, pro: 1, enterprise: 2 };

@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Resolves the user's effective tier (max of subscription + the highest active pass). */
  async resolve(userId: string): Promise<Entitlements> {
    const now = new Date();
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const plan: PlanType = user?.plan ?? 'free';

    // At most one active pass per level (grants extend, not stack), so the highest-ranked
    // active pass is the effective booster; show its expiry.
    const passes = await this.prisma.userPass.findMany({ where: { userId, expiresAt: { gt: now } } });
    let best: (typeof passes)[number] | null = null;
    for (const p of passes) {
      if (!best || RANK[p.level] > RANK[best.level]) best = p;
    }

    const tier: PlanType = best && RANK[best.level] > RANK[plan] ? best.level : plan;
    const activePass = best ? { level: best.level, expiresAt: best.expiresAt.toISOString() } : null;

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
