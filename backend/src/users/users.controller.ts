import { Controller, Delete, Get, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { UsersService } from './users.service';

@ApiTags('account')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lifetime usage counters for the current user' })
  stats(@CurrentUser() user: AuthUser) {
    return this.users.stats(user.id);
  }

  @Delete()
  @HttpCode(204)
  @ApiOperation({ summary: 'Permanently delete the account and all its data' })
  deleteAccount(@CurrentUser() user: AuthUser) {
    return this.users.deleteAccount(user);
  }
}
