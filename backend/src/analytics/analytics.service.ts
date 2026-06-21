import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

/** Server-side events the browser can't observe (async processing outcomes, plan changes). */
export type ServerEvent =
  | 'note_processed'
  | 'note_processing_failed'
  | 'plan_changed'
  | 'booster_activated';

/**
 * Owns server-side PostHog capture. Mirrors GeminiService: env-gated, a safe no-op
 * when POSTHOG_KEY is absent (local dev, tests). The frontend tracks user behaviour;
 * this captures the async lifecycle events that complete in the background.
 */
@Injectable()
export class AnalyticsService implements OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly client: PostHog | null;

  constructor(config: ConfigService) {
    const key = config.get<string>('POSTHOG_KEY', '');
    const host = config.get<string>('POSTHOG_HOST', 'https://us.i.posthog.com');
    this.client = key
      ? new PostHog(key, { host, flushAt: 1, flushInterval: 10_000 })
      : null;
    if (!this.client) {
      this.logger.log('PostHog not configured (POSTHOG_KEY missing) — server analytics disabled.');
    }
  }

  /** Fire-and-forget; never throws into the caller's path. */
  capture(distinctId: string, event: ServerEvent, properties?: Record<string, unknown>): void {
    if (!this.client) return;
    try {
      this.client.capture({ distinctId, event, properties });
    } catch (err) {
      this.logger.warn(`PostHog capture failed: ${String(err)}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.shutdown().catch(() => undefined);
  }
}
