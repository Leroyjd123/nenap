import type { CreateOrderResponse } from '@nenap/types';

/** What Razorpay Checkout hands back to the success handler. */
export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (r: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open(): void;
}
declare global {
  interface Window {
    Razorpay?: new (opts: RazorpayOptions) => RazorpayInstance;
  }
}

let scriptPromise: Promise<boolean> | null = null;

/** Inject Razorpay Checkout once, lazily (keeps it off every other page). */
export function loadRazorpay(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<boolean>((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(s);
  });
  return scriptPromise;
}

/** Open Checkout for an order. Resolves with the result, or null if the user dismisses. */
export function openCheckout(order: CreateOrderResponse, opts: { email?: string }): Promise<RazorpaySuccess | null> {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Checkout failed to load'));
      return;
    }
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'Nenap',
      description: order.label,
      prefill: opts.email ? { email: opts.email } : undefined,
      theme: { color: '#6f7d57' },
      handler: (r) => resolve(r),
      modal: { ondismiss: () => resolve(null) },
    });
    rzp.open();
  });
}
