import { cn } from '@/lib/cn';

/**
 * The Nenap logo lockup (firefly + wordmark), from the master brand asset.
 * Sized via `em`, so the existing `text-[Npx]` classes on callers scale it.
 */
export function Brand({ className }: { className?: string }) {
  return (
    <span
      className={cn('brand', className)}
      aria-label="Nenap"
      style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Nenap" className="brand-logo" style={{ height: '1.5em', width: 'auto', display: 'block' }} />
    </span>
  );
}
