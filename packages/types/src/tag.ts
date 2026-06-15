import { z } from 'zod';
import { IsoDate, Uuid } from './common.js';

export const Tag = z.object({
  id: Uuid,
  userId: Uuid,
  name: z.string().min(1).max(40),
  createdAt: IsoDate,
});
export type Tag = z.infer<typeof Tag>;

export const CreateTagInput = z.object({
  name: z.string().trim().min(1, 'Tag name is required').max(40),
});
export type CreateTagInput = z.infer<typeof CreateTagInput>;
