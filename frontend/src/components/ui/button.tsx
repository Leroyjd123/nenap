import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'soft' | 'ghost' | 'rec';
type Size = 'md' | 'sm' | 'lg' | 'icon' | 'block';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

// Uses the Hi-Fi .btn classes verbatim (see globals.css).
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'btn',
        `btn-${variant}`,
        size === 'sm' && 'btn-sm',
        size === 'lg' && 'btn-lg',
        size === 'icon' && 'btn-icon',
        size === 'block' && 'btn-block',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
