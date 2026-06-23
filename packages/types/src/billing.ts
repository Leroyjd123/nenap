import { z } from 'zod';
import { IsoDate } from './common.js';

/** Subscription tiers. Effective tier = max(plan, any active booster pass). */
export const Plan = z.enum(['free', 'basic', 'pro']);
export type Plan = z.infer<typeof Plan>;

/** Per-tier capability limits. `recordingsPerDay: null` means unlimited. */
export const TierLimits = z.object({
  recordingsPerDay: z.number().int().nullable(),
  maxRecordingSec: z.number().int(),
  improveAgain: z.boolean(),
  fileUploads: z.boolean(),
  maxPhotosPerNote: z.number().int(),
  storageMb: z.number().int(),
});
export type TierLimits = z.infer<typeof TierLimits>;

/** What the current user is entitled to right now (drives gating + the plans UI). */
export const Entitlements = z.object({
  plan: Plan, // the recurring subscription
  tier: Plan, // effective tier after any active booster
  limits: TierLimits,
  usage: z.object({ recordingsToday: z.number().int() }),
  activePass: z.object({ level: Plan, expiresAt: IsoDate }).nullable(),
});
export type Entitlements = z.infer<typeof Entitlements>;

/** Allowed booster durations (days). */
export const BoosterDays = z.union([z.literal(1), z.literal(3), z.literal(5)]);
export type BoosterDays = z.infer<typeof BoosterDays>;

/** Dev-only grant inputs (no real billing yet). */
export const SetPlanInput = z.object({ plan: Plan });
export type SetPlanInput = z.infer<typeof SetPlanInput>;

export const GrantPassInput = z.object({ days: BoosterDays, level: Plan.default('pro') });
export type GrantPassInput = z.infer<typeof GrantPassInput>;

/** Purchasable items. Boosters grant Pro for N days; plans grant a tier for 30 days. */
export const CheckoutSku = z.enum(['booster_1d', 'booster_3d', 'booster_5d', 'basic_30d', 'pro_30d']);
export type CheckoutSku = z.infer<typeof CheckoutSku>;

/** Client asks the server to create a Razorpay order for a SKU (amount is server-set). */
export const CreateOrderInput = z.object({ sku: CheckoutSku });
export type CreateOrderInput = z.infer<typeof CreateOrderInput>;

/** What the client needs to open Razorpay Checkout. */
export const CreateOrderResponse = z.object({
  orderId: z.string(),
  amount: z.number().int(), // paise
  currency: z.string(),
  keyId: z.string(), // Razorpay public key id
  sku: CheckoutSku,
  label: z.string(),
});
export type CreateOrderResponse = z.infer<typeof CreateOrderResponse>;

/** Returned by Razorpay Checkout, verified server-side before anything is granted. */
export const VerifyPaymentInput = z.object({
  sku: CheckoutSku,
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
export type VerifyPaymentInput = z.infer<typeof VerifyPaymentInput>;
