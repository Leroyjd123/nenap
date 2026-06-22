import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Langfuse, type LangfuseTraceClient } from 'langfuse';

export type { LangfuseTraceClient };

/**
 * Token counts from a model response, mapped to Langfuse's usageDetails shape.
 * The index signature lets it satisfy Langfuse's `{ [key: string]: number }` field.
 */
export interface GenerationUsage {
  [key: string]: number;
  input: number;
  output: number;
  total: number;
}

/**
 * LLM observability via Langfuse. Mirrors the analytics/Sentry pattern: env-gated and
 * a safe no-op when keys are absent. Traces group a note's Gemini calls (transcribe →
 * enhance → organise) so prompts, outputs, latency, token usage, and cost are visible.
 */
@Injectable()
export class LangfuseService implements OnModuleDestroy {
  private readonly logger = new Logger(LangfuseService.name);
  private readonly client: Langfuse | null;

  constructor(config: ConfigService) {
    const publicKey = config.get<string>('LANGFUSE_PUBLIC_KEY', '');
    const secretKey = config.get<string>('LANGFUSE_SECRET_KEY', '');
    const baseUrl = config.get<string>('LANGFUSE_BASEURL', 'https://cloud.langfuse.com');
    this.client = publicKey && secretKey ? new Langfuse({ publicKey, secretKey, baseUrl }) : null;
    if (!this.client) {
      this.logger.log('Langfuse not configured (LANGFUSE_*_KEY missing) — LLM tracing disabled.');
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  /** Start a trace for one logical task (e.g. processing a note). Undefined when disabled. */
  trace(opts: { name: string; userId?: string; metadata?: Record<string, unknown>; input?: unknown }): LangfuseTraceClient | undefined {
    return this.client?.trace(opts);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.shutdownAsync().catch(() => undefined);
  }
}
