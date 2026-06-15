import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'soft' | 'ghost' | 'rec';
type Size = 'md' | 'sm' | 'lg' | 'block';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Faithful to the Hi-Fi .btn classes: 1px lift on hover, sage primary, clay = recording only.
const base =
  'inline-flex items-center justify-center gap-2 font-ui font-semibold leading-none ' +
  'border border-transparent rounded-sm cursor-pointer transition-all duration-150 ' +
  'whitespace-nowrap hover:-translate-y-px active:translate-y-0 disabled:opacity-50 ' +
  'disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-[var(--accent-ink)] hover:bg-accent-deep ' +
    'shadow-[0_1px_0_var(--accent-deep),var(--shadow-1)]',
  soft: 'bg-surface border-line-2 text-ink shadow-1 hover:border-ink-3',
  ghost: 'text-ink-2 hover:bg-[color-mix(in_oklab,var(--ink)_6%,transparent)] hover:text-ink',
  rec: 'bg-rec-tint text-rec border-rec-line',
};

const sizes: Record<Size, string> = {
  md: 'text-sm px-[15px] py-[9px]',
  sm: 'text-[13px] px-3 py-[7px]',
  lg: 'text-[15px] px-5 py-3',
  block: 'w-full text-sm px-[15px] py-[10px]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], 'focus-ring', className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
