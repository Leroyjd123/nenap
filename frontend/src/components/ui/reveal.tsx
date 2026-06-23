'use client';

import { useEffect, useRef, useState, type HTMLAttributes } from 'react';

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  /** Stagger delay in ms (e.g. index * 70). */
  delay?: number;
}

/**
 * Reveals its children with a gentle fade-up the first time they scroll into view.
 * Pure CSS transition (.reveal / .reveal.in) toggled by an IntersectionObserver —
 * no animation library. Honoured calmly: `prefers-reduced-motion` shows it instantly.
 */
export function Reveal({ className = '', delay = 0, style, children, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    // If observers are unavailable, just show it (never leave content hidden).
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'in' : ''} ${className}`.trim()}
      style={{ ...style, transitionDelay: delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </div>
  );
}
