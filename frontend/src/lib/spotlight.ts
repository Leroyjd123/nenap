import type { MouseEvent } from 'react';

/**
 * Tracks the cursor over a `.spotlight` card by writing --mx/--my CSS vars, so the
 * soft glow follows the pointer. Writes straight to the DOM node (no React state /
 * re-render), matching how the effect stays cheap on hover.
 */
export function spotlightMove(e: MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`);
  el.style.setProperty('--my', `${e.clientY - r.top}px`);
}
