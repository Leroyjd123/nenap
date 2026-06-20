import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { ZodSchema } from 'zod';

/**
 * Validates and parses input against a shared Zod schema from @nenap/types.
 * Keeps the contract single-sourced: the same schema the frontend infers types
 * from is what the backend enforces at runtime.
 *
 * Usage: `@Body(new ZodValidationPipe(CreateNoteInput)) body: CreateNoteInput`
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`),
      );
    }
    return result.data;
  }
}
