import {
  CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { jwtVerify } from 'jose';
import type { AuthUser } from './auth-user';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Stateless verification of Supabase-issued JWTs.
 *
 * Supabase signs access tokens (HS256) with the project's JWT secret. We verify the
 * signature locally — no network call — and extract the user id (`sub`) and email.
 * The backend trusts nothing beyond a valid signature; data ownership is enforced
 * separately in the service layer.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly secret: Uint8Array;

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    const jwtSecret = config.get<string>('SUPABASE_JWT_SECRET', 'placeholder-jwt-secret-change-me');
    this.secret = new TextEncoder().encode(jwtSecret);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const { payload } = await jwtVerify(token, this.secret);
      const id = payload.sub;
      const email = typeof payload.email === 'string' ? payload.email : '';
      if (!id) {
        throw new UnauthorizedException('Token missing subject');
      }
      request.user = { id, email };
      return true;
    } catch (err) {
      this.logger.debug(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
