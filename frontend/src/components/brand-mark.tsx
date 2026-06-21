import type { CSSProperties } from 'react';

/**
 * The Nenap firefly mark, redrawn from the shared logo as a scalable, theme-aware SVG:
 * a sage body, a glowing abdomen, and two antennae. Uses currentColor so it can be
 * recoloured (defaults to the sage accent).
 */
export function BrandMark({
  size = '1.1em',
  className,
  style,
}: {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Nenap firefly"
      style={{ color: 'var(--accent)', flex: 'none', ...style }}
    >
      {/* body */}
      <ellipse cx="11" cy="12" rx="6.3" ry="3.4" transform="rotate(-24 11 12)" fill="currentColor" />
      {/* wing highlight */}
      <ellipse cx="12.6" cy="10.7" rx="3.3" ry="1.7" transform="rotate(-24 12.6 10.7)" fill="#ffffff" opacity="0.2" />
      {/* glowing abdomen */}
      <circle cx="6.6" cy="15" r="2.6" fill="#f2e7bf" />
      <circle cx="6.6" cy="15" r="2.6" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="0.8" />
      {/* antennae */}
      <path d="M15 9.4c1.2-1.6 2.3-2.3 3.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14.1 10.7c0.9-1.1 1.7-1.5 2.6-1.6" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <circle cx="18.7" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}
