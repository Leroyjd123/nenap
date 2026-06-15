import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

// Faithful to the Hi-Fi .input: surface fill, hairline border, accent focus ring.
export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full font-ui text-sm text-ink bg-surface border border-line-2 rounded-sm',
      'px-[13px] py-[10px] outline-none transition-all duration-150',
      'placeholder:text-ink-3 focus-ring',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
