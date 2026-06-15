import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it } from 'vitest';
import { SupabaseAuthGuard } from './supabase-auth.guard';

const SECRET = 'test-secret-at-least-32-characters-long-xx';

function makeContext(headers: Record<string, string>, isPublic = false) {
  const request: { headers: Record<string, string>; user?: unknown } = { headers };
  const reflector = {
    getAllAndOverride: () => isPublic,
  } as unknown as Reflector;
  const config = {
    get: () => SECRET,
  } as unknown as ConfigService;
  const ctx = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;
  return { ctx, request, reflector, config };
}

async function signToken(payload: Record<string, unknown>, secret = SECRET): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(secret));
}

describe('SupabaseAuthGuard', () => {
  let build: typeof makeContext;
  beforeEach(() => {
    build = makeContext;
  });

  it('allows public routes without a token', async () => {
    const { ctx, reflector, config } = build({}, true);
    const guard = new SupabaseAuthGuard(reflector, config);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('rejects a request with no authorization header', async () => {
    const { ctx, reflector, config } = build({});
    const guard = new SupabaseAuthGuard(reflector, config);
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a valid token and populates the user', async () => {
    const token = await signToken({ sub: 'user-123', email: 'a@b.com' });
    const { ctx, request, reflector, config } = build({ authorization: `Bearer ${token}` });
    const guard = new SupabaseAuthGuard(reflector, config);
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-123', email: 'a@b.com' });
  });

  it('rejects a token signed with the wrong secret', async () => {
    const token = await signToken({ sub: 'user-123' }, 'a-different-secret-key-32-characters-x');
    const { ctx, reflector, config } = build({ authorization: `Bearer ${token}` });
    const guard = new SupabaseAuthGuard(reflector, config);
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
