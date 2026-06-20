import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { TagsService } from './tags.service';

@ApiTags('tags')
@ApiBearerAuth()
@Controller('tags')
export class TagsController {
  constructor(private readonly tags: TagsService) {}

  // Tags are created implicitly when attached to notes (capture-first); this lists
  // the user's existing tags for filters and the tag picker.
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.tags.list(user);
  }
}
