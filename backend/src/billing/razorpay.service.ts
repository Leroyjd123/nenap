import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import Razorpay from 'razorpay';

/**
 * Razorpay client wrapper. Env-gated (no-op until RAZORPAY_KEY_* are set). The secret
 * never leaves the server; the key id is public (Checkout needs it). All payments are
 * signature-verified here before any entitlement is granted.
 */
@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly client: Razorpay | null;
  readonly keyId: string;
  private readonly keySecret: string;

  constructor(config: ConfigService) {
    this.keyId = config.get<string>('RAZORPAY_KEY_ID', '');
    this.keySecret = config.get<string>('RAZORPAY_KEY_SECRET', '');
    this.client =
      this.keyId && this.keySecret ? new Razorpay({ key_id: this.keyId, key_secret: this.keySecret }) : null;
    if (!this.client) {
      this.logger.log('Razorpay not configured (RAZORPAY_KEY_* missing) — checkout disabled.');
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  /** Create a one-time order for `amount` paise. */
  async createOrder(amount: number, receipt: string, notes: Record<string, string>): Promise<string> {
    if (!this.client) throw new ServiceUnavailableException('Payments are not configured');
    const order = await this.client.orders.create({ amount, currency: 'INR', receipt, notes });
    return order.id;
  }

  /** Verify a Checkout callback: HMAC-SHA256(order_id|payment_id, secret) === signature. */
  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!this.keySecret || !signature) return false;
    const expected = createHmac('sha256', this.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    return a.length === b.length && timingSafeEqual(a, b);
  }
}
