import { z } from 'zod';

/** Validates process.env at boot. Fails fast with a clear message if misconfigured. */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  BACKEND_PORT: z.coerce.number().int().default(4000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000')
    .transform((s) => s.split(',').map((o) => o.trim()).filter(Boolean)),
  SUPABASE_URL: z.string().default('https://placeholder.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder-service-role-key'),
  // New-format secret key (sb_secret_…) for Storage signing; falls back to service-role.
  SUPABASE_SECRET_KEY: z.string().default(''),
  SUPABASE_JWT_SECRET: z.string().min(1).default('placeholder-jwt-secret-change-me'),
  RECORDINGS_BUCKET: z.string().default('recordings'),
  GEMINI_API_KEY: z.string().default('placeholder-gemini-key'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  // PostHog server-side capture (async lifecycle events the client can't see).
  // Optional — analytics is a no-op when the key is absent.
  POSTHOG_KEY: z.string().default(''),
  POSTHOG_HOST: z.string().default('https://us.i.posthog.com'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
