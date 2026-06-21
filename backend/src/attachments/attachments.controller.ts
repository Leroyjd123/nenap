import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAttachmentInput, SignAttachmentInput } from '@nenap/types';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AttachmentsService } from './attachments.service';

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('notes/:noteId/attachments')
export class AttachmentsController {
  constructor(private readonly attachments: AttachmentsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Param('noteId') noteId: string) {
    return this.attachments.list(user, noteId);
  }

  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post('sign')
  sign(
    @CurrentUser() user: AuthUser,
    @Param('noteId') noteId: string,
    @Body(new ZodValidationPipe(SignAttachmentInput)) body: SignAttachmentInput,
  ) {
    return this.attachments.sign(user, noteId, body);
  }

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Param('noteId') noteId: string,
    @Body(new ZodValidationPipe(CreateAttachmentInput)) body: CreateAttachmentInput,
  ) {
    return this.attachments.create(user, noteId, body);
  }

  @Delete(':attachmentId')
  @HttpCode(204)
  remove(
    @CurrentUser() user: AuthUser,
    @Param('noteId') noteId: string,
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.attachments.remove(user, noteId, attachmentId);
  }
}
