import DOMPurify from 'isomorphic-dompurify';

// The only tags our enhanced notes / Tiptap content legitimately use. Anything else
// (script, iframe, event handlers, javascript: URLs) is stripped.
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u',
  's', 'a', 'blockquote', 'br', 'hr', 'code', 'pre', 'mark',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

/**
 * Sanitizes note HTML before it's rendered with dangerouslySetInnerHTML. Both the
 * user's original content (Tiptap) and the AI-enhanced HTML pass through here — never
 * trust either as raw markup. Runs on server and client (isomorphic).
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#)/i,
    ADD_ATTR: ['target'],
  });
}
