import { Global, Module } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

/** Global so RecordingsService / ProcessingService can enforce limits. */
@Global()
@Module({
  controllers: [BillingController],
  providers: [EntitlementsService, BillingService],
  exports: [EntitlementsService],
})
export class BillingModule {}
