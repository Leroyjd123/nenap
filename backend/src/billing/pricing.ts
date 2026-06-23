import type { CheckoutSku, Plan } from '@nenap/types';

export interface PricedItem {
  level: Plan;
  days: number;
  amount: number; // INR paise (server-authoritative — never trust the client)
  label: string;
}

/**
 * Server-side price list. Boosters grant a short Enterprise (top-tier) burst; plan SKUs
 * grant a tier for 30 days (one-time, no auto-renew). Edit amounts here to reprice.
 */
export const PRICING: Record<CheckoutSku, PricedItem> = {
  booster_1d: { level: 'enterprise', days: 1, amount: 2900, label: 'Nenap Enterprise — 1 day' },
  booster_3d: { level: 'enterprise', days: 3, amount: 6900, label: 'Nenap Enterprise — 3 days' },
  booster_5d: { level: 'enterprise', days: 5, amount: 9900, label: 'Nenap Enterprise — 5 days' },
  pro_30d: { level: 'pro', days: 30, amount: 14900, label: 'Nenap Pro — 30 days' },
  enterprise_30d: { level: 'enterprise', days: 30, amount: 39900, label: 'Nenap Enterprise — 30 days' },
};
