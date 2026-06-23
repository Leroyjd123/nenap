import { Global, Module } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { RazorpayService } from './razorpay.service';

/** Global so RecordingsService / ProcessingService can enforce limits. */
@Global()
@Module({
  controllers: [BillingController],
  providers: [EntitlementsService, BillingService, RazorpayService],
  exports: [EntitlementsService],
})
export class BillingModule {}
