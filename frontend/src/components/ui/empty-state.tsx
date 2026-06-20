import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  hint: string;
  action?: ReactNode;
}

/** Never leave a screen blank. Encouraging microcopy lowers the barrier to entry. */
export function EmptyState({ title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-16 px-6">
      <div
        className="w-14 h-14 rounded-full grid place-items-center mb-1"
        style={{ background: 'var(--accent-tint)' }}
        aria-hidden
      >
        <span className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />
      </div>
      <p className="font-display text-[20px] text-ink m-0">{title}</p>
      <p className="text-ink-2 text-sm m-0 max-w-[320px] leading-relaxed">{hint}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
