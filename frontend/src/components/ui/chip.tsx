import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  dashed?: boolean;
}

/** Filter / picker chip (.chip / .chip.on). */
export function Chip({ children, active, onClick, dashed }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('chip', active && 'on')}
      style={dashed ? { borderStyle: 'dashed', color: 'var(--accent-deep)' } : undefined}
    >
      {children}
    </button>
  );
}
