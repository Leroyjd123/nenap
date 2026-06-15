import { z } from 'zod';

/** UUID string (Supabase auth user ids and all primary keys are UUIDs). */
export const Uuid = z.string().uuid();

/** ISO-8601 timestamp string as serialized over the wire. */
export const IsoDate = z.string().datetime({ offset: true });

/** Standard cursor/offset pagination query. */
export const Pagination = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type Pagination = z.infer<typeof Pagination>;

/** Generic paginated envelope. */
export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().min(0),
    limit: z.number().int(),
    offset: z.number().int(),
  });

/** Shared error shape returned by the API. */
export const ApiError = z.object({
  statusCode: z.number().int(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiError>;
