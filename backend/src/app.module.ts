import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { validateEnv } from './config/env';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { FoldersModule } from './folders/folders.module';
import { TagsModule } from './tags/tags.module';
import { StorageModule } from './storage/storage.module';
import { GeminiModule } from './gemini/gemini.module';
import { ProcessingModule } from './processing/processing.module';
import { RecordingsModule } from './recordings/recordings.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { BillingModule } from './billing/billing.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    // First import: captures errors from every module below (no-op without SENTRY_DSN).
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    AnalyticsModule,
    // Baseline abuse protection: 120 requests/min per IP. Expensive routes (AI,
    // uploads) tighten this with @Throttle. Keyed by IP (set trust proxy for the
    // real client IP behind Cloud Run / Vercel).
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    BillingModule,
    StorageModule,
    GeminiModule,
    ProcessingModule,
    HealthModule,
    NotesModule,
    FoldersModule,
    TagsModule,
    RecordingsModule,
    AttachmentsModule,
  ],
  providers: [
    // Captures unhandled exceptions to Sentry, then delegates to Nest's default
    // handling (so HTTP responses are unchanged). No-op without SENTRY_DSN.
    { provide: APP_FILTER, useClass: SentryGlobalFilter },
    // Apply the throttler globally (runs alongside the auth guard).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
