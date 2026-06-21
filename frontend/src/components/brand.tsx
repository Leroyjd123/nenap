import { cn } from '@/lib/cn';
import { BrandMark } from '@/components/brand-mark';

/** The Nenap lockup: the firefly mark + the wordmark (trailing dot is the sage accent). */
export function Brand({ className }: { className?: string }) {
  return (
    <span
      className={cn('brand', className)}
      aria-label="Nenap"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.32em' }}
    >
      <BrandMark />
      <span>
        Nenap<span className="dot">.</span>
      </span>
    </span>
  );
}
