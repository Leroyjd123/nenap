import { describe, expect, it } from 'vitest';
import { validateEnv } from './env';

describe('validateEnv', () => {
  it('parses a minimal valid env with defaults', () => {
    const env = validateEnv({ DATABASE_URL: 'postgresql://x' });
    expect(env.BACKEND_PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:3000']);
  });

  it('splits CORS_ORIGINS into a trimmed array', () => {
    const env = validateEnv({
      DATABASE_URL: 'postgresql://x',
      CORS_ORIGINS: 'http://a.com, http://b.com',
    });
    expect(env.CORS_ORIGINS).toEqual(['http://a.com', 'http://b.com']);
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => validateEnv({})).toThrow(/Invalid environment configuration/);
  });
});
