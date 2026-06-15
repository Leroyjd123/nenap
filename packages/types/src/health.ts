import { z } from 'zod';
import { IsoDate } from './common.js';

export const HealthResponse = z.object({
  status: z.literal('ok'),
  service: z.string(),
  time: IsoDate,
});
export type HealthResponse = z.infer<typeof HealthResponse>;

/** Returned by an authenticated probe — confirms the JWT handshake works. */
export const MeResponse = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
export type MeResponse = z.infer<typeof MeResponse>;
