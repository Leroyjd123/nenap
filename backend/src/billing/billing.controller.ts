import { Body, Controller, ForbiddenException, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GrantPassInput, SetPlanInput } from '@nenap/types';
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

  private assertDev(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev grants are disabled in production');
    }
  }
}
