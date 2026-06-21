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
