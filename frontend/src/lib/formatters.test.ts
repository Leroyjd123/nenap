import { describe, it, expect } from 'vitest';
import { fmtDuration } from '@/lib/recordings';
import { fmtBytes, kindFor } from '@/lib/attachments';

describe('fmtDuration', () => {
  it('formats mm:ss with zero-padding', () => {
    expect(fmtDuration(0)).toBe('00:00');
    expect(fmtDuration(5)).toBe('00:05');
    expect(fmtDuration(65)).toBe('01:05');
    expect(fmtDuration(600)).toBe('10:00');
  });
});

describe('fmtBytes', () => {
  it('formats B / KB / MB', () => {
    expect(fmtBytes(512)).toBe('512 B');
    expect(fmtBytes(2048)).toBe('2 KB');
    expect(fmtBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('kindFor', () => {
  const fileWith = (type: string) => ({ type }) as unknown as File;
  it('classifies images vs everything else', () => {
    expect(kindFor(fileWith('image/png'))).toBe('image');
    expect(kindFor(fileWith('application/pdf'))).toBe('file');
    expect(kindFor(fileWith(''))).toBe('file');
  });
});
