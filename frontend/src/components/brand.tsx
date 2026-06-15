import { cn } from '@/lib/cn';

/** The Nenap wordmark. The trailing dot is the firefly accent in sage. */
export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn('brand', className)} aria-label="Nenap">
      Nenap<span className="dot">.</span>
    </span>
  );
}
