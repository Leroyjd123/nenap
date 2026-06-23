import { BadRequestException, Injectable } from '@nestjs/common';
import type { Plan as PlanType } from '@prisma/client';
import type { CheckoutSku, CreateOrderResponse, VerifyPaymentInput } from '@nenap/types';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { RazorpayService } from './razorpay.service';
import { PRICING } from './pricing';
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
    private readonly analytics: AnalyticsService,
    private readonly razorpay: RazorpayService,
  ) {}

  async setPlan(user: AuthUser, plan: PlanType): Promise<void> {
    await this.users.ensureUser(user);
    await this.prisma.user.update({ where: { id: user.id }, data: { plan } });
    this.analytics.capture(user.id, 'plan_changed', { plan });
  }

  /** Grants a booster: `level` (typically pro) for `days`, from now. */
  async grantPass(user: AuthUser, days: number, level: PlanType, source = 'grant'): Promise<void> {
    await this.users.ensureUser(user);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await this.prisma.userPass.create({ data: { userId: user.id, level, expiresAt, source } });
    this.analytics.capture(user.id, 'booster_activated', { days, level, source });
  }

  /** Create a Razorpay order for a SKU (amount is server-set from PRICING). */
  async createCheckoutOrder(user: AuthUser, sku: CheckoutSku): Promise<CreateOrderResponse> {
    await this.users.ensureUser(user);
    const item = PRICING[sku];
    const receipt = `nenap_${sku}_${Date.now().toString(36)}`;
    const orderId = await this.razorpay.createOrder(item.amount, receipt, { sku, userId: user.id });
    return { orderId, amount: item.amount, currency: 'INR', keyId: this.razorpay.keyId, sku, label: item.label };
  }

  /**
   * Verify a Razorpay Checkout result server-side, then grant the purchased pass.
   * Never grants anything unless the signature checks out.
   */
  async verifyAndGrant(user: AuthUser, input: VerifyPaymentInput): Promise<void> {
    const ok = this.razorpay.verifySignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature);
    if (!ok) throw new BadRequestException('Payment could not be verified');
    const item = PRICING[input.sku];
    await this.grantPass(user, item.days, item.level as PlanType, 'razorpay');
  }
}
