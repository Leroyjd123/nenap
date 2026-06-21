import { Injectable } from '@nestjs/common';
import type { Plan as PlanType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { AuthUser } from '../auth/auth-user';

/**
 * Dev-only plan/pass grants (no real billing yet — Stripe is a later phase).
 * These let us exercise the tiers end-to-end before payments exist.
 */
@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async setPlan(user: AuthUser, plan: PlanType): Promise<void> {
    await this.users.ensureUser(user);
    await this.prisma.user.update({ where: { id: user.id }, data: { plan } });
  }

  /** Grants a booster: `level` (typically pro) for `days`, from now. */
  async grantPass(user: AuthUser, days: number, level: PlanType): Promise<void> {
    await this.users.ensureUser(user);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.prisma.userPass.create({ data: { userId: user.id, level, expiresAt, source: 'grant' } });
  }
}
