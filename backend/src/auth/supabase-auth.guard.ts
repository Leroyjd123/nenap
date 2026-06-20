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
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify, type JWTPayload } from 'jose';
import type { AuthUser } from './auth-user';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Stateless verification of Supabase-issued JWTs.
 *
 * Supabase signs access tokens either:
 *  - asymmetrically (ES256/RS256) — verified against the project's public JWKS
 *    at {SUPABASE_URL}/auth/v1/.well-known/jwks.json (no shared secret needed), or
 *  - symmetrically (HS256) — verified with the legacy SUPABASE_JWT_SECRET.
 *
 * We branch on the token's `alg` header so either project configuration works.
 * The backend trusts nothing beyond a valid signature; ownership is enforced in
 * the service layer.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);
  private readonly hsSecret: Uint8Array;
  private readonly jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly reflector: Reflector,
    config: ConfigService,
  ) {
    const jwtSecret = config.get<string>('SUPABASE_JWT_SECRET', 'placeholder-jwt-secret-change-me');
    this.hsSecret = new TextEncoder().encode(jwtSecret);

    const supabaseUrl = config.get<string>('SUPABASE_URL', '');
    if (supabaseUrl && !supabaseUrl.includes('YOUR_PROJECT_REF')) {
      this.jwks = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`));
    }
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
      const payload = await this.verify(token);
      const id = payload.sub;
      const email = typeof payload.email === 'string' ? payload.email : '';
      if (!id) {
        throw new UnauthorizedException('Token missing subject');
      }
      request.user = { id, email };
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.debug(`Token verification failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private async verify(token: string): Promise<JWTPayload> {
    const { alg } = decodeProtectedHeader(token);
    if (alg?.startsWith('HS')) {
      const { payload } = await jwtVerify(token, this.hsSecret);
      return payload;
    }
    if (!this.jwks) {
      throw new UnauthorizedException('Asymmetric token received but SUPABASE_URL is not configured');
    }
    const { payload } = await jwtVerify(token, this.jwks);
    return payload;
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [scheme, value] = header.split(' ');
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
