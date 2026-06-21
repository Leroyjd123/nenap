import { Controller, HttpCode, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { ProcessingService } from './processing.service';

@ApiTags('processing')
@ApiBearerAuth()
@Controller('notes/:noteId')
export class ProcessingController {
  constructor(private readonly processing: ProcessingService) {}

  // AI is the expensive path — cap re-runs hard (10/min per IP).
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('improve')
  @HttpCode(202)
  @ApiOperation({ summary: 'Re-run enhancement, producing a new enhanced version' })
  async improve(@CurrentUser() user: AuthUser, @Param('noteId') noteId: string) {
    await this.processing.improve(user, noteId);
    return { status: 'processing' };
  }
}
