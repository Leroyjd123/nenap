import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Plan as PlanType } from '@prisma/client';
import type { CheckoutSku, CreateOrderResponse, Order, VerifyPaymentInput } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { RazorpayService } from './razorpay.service';
import { PRICING } from './pricing';
import type { AuthUser } from '../auth/auth-user';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly analytics: AnalyticsService,
    private readonly razorpay: RazorpayService,
  ) {}

  /** DEV: directly set the recurring subscription tier. */
  async setPlan(user: AuthUser, plan: PlanType): Promise<void> {
    await this.users.ensureUser(user);
    await this.prisma.user.update({ where: { id: user.id }, data: { plan } });
    this.analytics.capture(user.id, 'plan_changed', { plan });
  }

  /**
   * Grant `level` for `days`. If an active pass of the same level exists we EXTEND it
   * (so buying Pro twice = 60 days, never two overlapping passes); otherwise create one.
   */
  async grantPass(user: AuthUser, days: number, level: PlanType, source = 'grant'): Promise<void> {
    await this.users.ensureUser(user);
    const now = new Date();
    const existing = await this.prisma.userPass.findFirst({
      where: { userId: user.id, level, expiresAt: { gt: now } },
      orderBy: { expiresAt: 'desc' },
    });
    if (existing) {
      await this.prisma.userPass.update({
        where: { id: existing.id },
        data: { expiresAt: new Date(existing.expiresAt.getTime() + days * DAY_MS) },
      });
    } else {
      await this.prisma.userPass.create({
        data: { userId: user.id, level, expiresAt: new Date(now.getTime() + days * DAY_MS), source },
      });
    }
    this.analytics.capture(user.id, 'booster_activated', { days, level, source });
  }

  /** Create a Razorpay order for a SKU (amount is server-set) and record the pending order. */
  async createCheckoutOrder(user: AuthUser, sku: CheckoutSku): Promise<CreateOrderResponse> {
    await this.users.ensureUser(user);
    const item = PRICING[sku];
    const receipt = `nenap_${sku}_${Date.now().toString(36)}`;
    const orderId = await this.razorpay.createOrder(item.amount, receipt, { sku, userId: user.id });
    await this.prisma.payment.create({
      data: {
        userId: user.id,
        sku,
        level: item.level,
        days: item.days,
        amount: item.amount,
        razorpayOrderId: orderId,
        status: 'created',
      },
    });
    return { orderId, amount: item.amount, currency: 'INR', keyId: this.razorpay.keyId, sku, label: item.label };
  }

  /**
   * Verify a Razorpay Checkout result server-side, mark the order paid, and grant the
   * purchased pass. Nothing is granted unless the signature checks out. Idempotent —
   * a replayed callback for an already-paid order is a no-op.
   */
  async verifyAndGrant(user: AuthUser, input: VerifyPaymentInput): Promise<void> {
    const payment = await this.prisma.payment.findUnique({ where: { razorpayOrderId: input.razorpayOrderId } });
    if (!payment || payment.userId !== user.id) throw new NotFoundException('Order not found');
    if (payment.status === 'paid') return; // already granted

    const ok = this.razorpay.verifySignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature);
    if (!ok) {
      await this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'failed' } });
      throw new BadRequestException('Payment could not be verified');
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid', razorpayPaymentId: input.razorpayPaymentId, paidAt: new Date() },
    });
    await this.grantPass(user, payment.days, payment.level, 'razorpay');
  }

  /** The user's purchase history, newest first. */
  async listOrders(user: AuthUser): Promise<Order[]> {
    const rows = await this.prisma.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return rows.map((p) => ({
      id: p.id,
      sku: p.sku as Order['sku'],
      level: p.level,
      days: p.days,
      amount: p.amount,
      currency: p.currency,
      status: p.status as Order['status'],
      createdAt: p.createdAt.toISOString(),
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    }));
  }
}
