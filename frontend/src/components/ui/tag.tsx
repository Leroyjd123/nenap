import { cn } from '@/lib/cn';

/** Mono tag chip in accent tint (.tag). `plain` uses the neutral surface fill. */
export function Tag({ label, plain }: { label: string; plain?: boolean }) {
  return (
    <span
      className={cn(
        'font-mono text-[10.5px] tracking-[0.04em] rounded-[5px] px-[7px] py-[3px] whitespace-nowrap',
        plain ? 'text-ink-2 bg-surface-3' : 'text-accent-deep bg-accent-tint',
      )}
    >
      {label}
    </span>
  );
}
