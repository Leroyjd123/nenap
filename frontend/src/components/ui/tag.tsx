import { cn } from '@/lib/cn';

/** Mono tag chip (.tag) in accent tint; `plain` uses the neutral surface fill. */
export function Tag({ label, plain }: { label: string; plain?: boolean }) {
  return <span className={cn('tag', plain && 'plain')}>{label}</span>;
}
