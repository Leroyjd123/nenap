import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompleteRecordingInput, SignRecordingInput } from '@nenap/types';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RecordingsService } from './recordings.service';

@ApiTags('recordings')
@ApiBearerAuth()
@Controller('notes/:noteId/recording')
export class RecordingsController {
  constructor(private readonly recordings: RecordingsService) {}

  @Post('sign')
  sign(
    @CurrentUser() user: AuthUser,
    @Param('noteId') noteId: string,
    @Body(new ZodValidationPipe(SignRecordingInput)) body: SignRecordingInput,
  ) {
    return this.recordings.sign(user, noteId, body);
  }

  @Post('complete')
  complete(
    @CurrentUser() user: AuthUser,
    @Param('noteId') noteId: string,
    @Body(new ZodValidationPipe(CompleteRecordingInput)) body: CompleteRecordingInput,
  ) {
    return this.recordings.complete(user, noteId, body);
  }

  @Get('url')
  playbackUrl(@CurrentUser() user: AuthUser, @Param('noteId') noteId: string) {
    return this.recordings.getPlaybackUrl(user, noteId);
  }
}
