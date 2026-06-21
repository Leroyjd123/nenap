import { z } from 'zod';

/** Lifetime usage counters for the account page. */
export const AccountStats = z.object({
  notes: z.number().int(),
  recordings: z.number().int(),
  transcripts: z.number().int(),
  enhancedVersions: z.number().int(),
  attachments: z.number().int(),
  folders: z.number().int(),
  tags: z.number().int(),
  storageBytes: z.number().int(),
});
export type AccountStats = z.infer<typeof AccountStats>;
