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
  // Sentry error tracking. Optional — no DSN means the SDK never initialises.
  // (instrument.ts reads these from process.env directly, as it runs pre-bootstrap.)
  SENTRY_DSN: z.string().default(''),
  SENTRY_ENVIRONMENT: z.string().default(''),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
  // Resend transactional email. Optional — no key means email is a no-op.
  RESEND_API_KEY: z.string().default(''),
  MAIL_FROM: z.string().default('Nenap <onboarding@resend.dev>'),
  // Public app URL used for links in emails.
  APP_URL: z.string().default('http://localhost:3000'),
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
