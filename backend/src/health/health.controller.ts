import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { HealthResponse, MeResponse } from '@nenap/types';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user';
import { Public } from '../auth/public.decorator';

@ApiTags('health')
@Controller()
export class HealthController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Liveness probe (no auth required)' })
  health(): HealthResponse {
    return { status: 'ok', service: 'nenap-backend', time: new Date().toISOString() };
  }

  @Get('me')
  @ApiOperation({ summary: 'Returns the authenticated user — proves the JWT handshake' })
  me(@CurrentUser() user: AuthUser): MeResponse {
    return { id: user.id, email: user.email };
  }
}
