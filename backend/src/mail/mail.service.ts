import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { processingFailedEmail, welcomeEmail } from './templates';

/**
 * Transactional email via Resend. Mirrors the analytics/Sentry pattern: env-gated and
 * a safe no-op without RESEND_API_KEY. All sends are fire-and-forget — email never
 * blocks or fails a user request (each method swallows its own errors).
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(config: ConfigService) {
    const key = config.get<string>('RESEND_API_KEY', '');
    this.resend = key ? new Resend(key) : null;
    this.from = config.get<string>('MAIL_FROM', 'Nenap <onboarding@resend.dev>');
    this.appUrl = config.get<string>('APP_URL', 'http://localhost:3000');
    if (!this.resend) {
      this.logger.log('Resend not configured (RESEND_API_KEY missing) — transactional email disabled.');
    }
  }

  sendWelcome(to: string): void {
    const { subject, html } = welcomeEmail(this.appUrl);
    this.send(to, subject, html);
  }

  sendProcessingFailed(to: string, noteTitle: string, noteId: string): void {
    const { subject, html } = processingFailedEmail(this.appUrl, noteTitle, noteId);
    this.send(to, subject, html);
  }

  /** Fire-and-forget. Never throws into the caller; logs and moves on. */
  private send(to: string, subject: string, html: string): void {
    if (!this.resend || !to || to.endsWith('@placeholder.local')) return;
    void this.resend.emails
      .send({ from: this.from, to, subject, html })
      .then((res) => {
        if (res.error) this.logger.warn(`Resend rejected "${subject}" to ${to}: ${res.error.message}`);
      })
      .catch((err: unknown) => this.logger.warn(`Email send failed ("${subject}"): ${String(err)}`));
  }
}
