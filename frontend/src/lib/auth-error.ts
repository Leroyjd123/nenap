/**
 * Supabase appends auth errors to the redirect URL — sometimes in the query string,
 * sometimes in the hash fragment (e.g. ?error=access_denied&error_description=…#error=…).
 * Reads either, returns a human message or null.
 */
export function readAuthError(): string | null {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search);
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const desc = q.get('error_description') ?? h.get('error_description');
  return desc ? decodeURIComponent(desc.replace(/\+/g, ' ')) : null;
}

/** Strips error/query/hash params from the URL without a reload. */
export function clearUrlParams(): void {
  if (typeof window === 'undefined') return;
  window.history.replaceState({}, '', window.location.pathname);
}
