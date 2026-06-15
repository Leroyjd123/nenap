import { z } from 'zod';
import { IsoDate, Uuid } from './common.js';

export const Folder = z.object({
  id: Uuid,
  userId: Uuid,
  name: z.string().min(1).max(60),
  noteCount: z.number().int().min(0).optional(),
  createdAt: IsoDate,
  updatedAt: IsoDate,
});
export type Folder = z.infer<typeof Folder>;

export const CreateFolderInput = z.object({
  name: z.string().trim().min(1, 'Folder name is required').max(60),
});
export type CreateFolderInput = z.infer<typeof CreateFolderInput>;

export const UpdateFolderInput = CreateFolderInput.partial();
export type UpdateFolderInput = z.infer<typeof UpdateFolderInput>;
