import { Body, Controller, ForbiddenException, Get, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateOrderInput, GrantPassInput, SetPlanInput, VerifyPaymentInput } from '@nenap/types';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { EntitlementsService } from './entitlements.service';
import { BillingService } from './billing.service';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(
    private readonly entitlements: EntitlementsService,
    private readonly billing: BillingService,
  ) {}

  /** What the current user is entitled to right now. */
  @Get('entitlements')
  getEntitlements(@CurrentUser() user: AuthUser) {
    return this.entitlements.resolve(user.id);
  }

  /** The user's purchase history (for the account page). */
  @Get('orders')
  getOrders(@CurrentUser() user: AuthUser) {
    return this.billing.listOrders(user);
  }

  /** DEV ONLY: set the subscription tier (stand-in for Stripe checkout). */
  @Post('dev/plan')
  @HttpCode(204)
  async setPlan(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(SetPlanInput)) body: SetPlanInput,
  ) {
    this.assertDev();
    await this.billing.setPlan(user, body.plan);
  }

  /** DEV ONLY: grant a booster pass (stand-in for a one-time purchase). */
  @Post('dev/pass')
  @HttpCode(204)
  async grantPass(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(GrantPassInput)) body: GrantPassInput,
  ) {
    this.assertDev();
    await this.billing.grantPass(user, body.days, body.level);
  }

  /** Create a Razorpay order for a SKU. Client opens Checkout with the returned order. */
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('checkout/order')
  async createOrder(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(CreateOrderInput)) body: CreateOrderInput,
  ) {
    return this.billing.createCheckoutOrder(user, body.sku);
  }

  /** Verify a completed Checkout server-side and grant the purchased plan/booster. */
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('checkout/verify')
  @HttpCode(204)
  async verify(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(VerifyPaymentInput)) body: VerifyPaymentInput,
  ) {
    await this.billing.verifyAndGrant(user, body);
  }

  private assertDev(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev grants are disabled in production');
    }
  }
}
