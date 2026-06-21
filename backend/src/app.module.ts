import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
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
})
export class AppModule {}
