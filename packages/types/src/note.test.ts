import { describe, expect, it } from 'vitest';
import { CreateNoteInput, ListNotesQuery } from './note.js';

describe('CreateNoteInput', () => {
  it('applies defaults for an empty note (capture-first)', () => {
    const parsed = CreateNoteInput.parse({});
    expect(parsed.title).toBe('');
    expect(parsed.originalContent).toBe('');
  });

  it('rejects more than 20 tags', () => {
    const tagNames = Array.from({ length: 21 }, (_, i) => `tag-${i}`);
    expect(() => CreateNoteInput.parse({ tagNames })).toThrow();
  });
});

describe('ListNotesQuery', () => {
  it('coerces query-string values', () => {
    const parsed = ListNotesQuery.parse({ hasRecording: 'true', limit: '10' });
    expect(parsed.hasRecording).toBe(true);
    expect(parsed.limit).toBe(10);
  });
});
