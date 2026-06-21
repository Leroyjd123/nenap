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

/** Turns raw Supabase auth errors into calm, human sign-in copy. */
export function humanizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don’t match. Try again.';
  if (m.includes('email not confirmed')) return 'Please confirm your email first — check your inbox for the link.';
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password should be') || m.includes('at least 6'))
    return 'Use a password with at least 6 characters.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts — wait a moment and try again.';
  if (m.includes('unable to validate email') || m.includes('invalid email'))
    return 'That email doesn’t look right. Check it and try again.';
  if (m.includes('network') || m.includes('failed to fetch'))
    return 'We couldn’t reach the server. Check your connection and try again.';
  return message;
}
