import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  it('keeps allowed formatting tags', () => {
    const out = sanitizeHtml('<h2>Title</h2><p>Hello <strong>world</strong></p><ul><li>a</li></ul>');
    expect(out).toContain('<h2>Title</h2>');
    expect(out).toContain('<strong>world</strong>');
    expect(out).toContain('<li>a</li>');
  });

  it('strips <script> tags and their content', () => {
    expect(sanitizeHtml('<p>ok</p><script>alert(1)</script>')).toBe('<p>ok</p>');
  });

  it('removes inline event-handler attributes', () => {
    expect(sanitizeHtml('<p onclick="steal()">hi</p>')).toBe('<p>hi</p>');
  });

  it('blocks javascript: URLs on links (drops the href)', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(out).not.toContain('javascript:');
  });

  it('keeps https links', () => {
    expect(sanitizeHtml('<a href="https://example.com">x</a>')).toContain('href="https://example.com"');
  });

  it('drops disallowed embeds like <iframe>', () => {
    expect(sanitizeHtml('<iframe src="https://evil.com"></iframe><p>safe</p>')).toBe('<p>safe</p>');
  });
});
