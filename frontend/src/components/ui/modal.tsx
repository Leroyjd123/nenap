'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Centered modal on desktop, bottom sheet on mobile (.scrim/.modal/.sheet).
 * Closes on Escape and scrim click.
 */
export function Modal({ open, onClose, title, subtitle, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-0 sm:p-6
                 bg-[rgba(38,36,30,0.34)] backdrop-blur-[3px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full bg-surface shadow-2 p-6 max-sm:rounded-t-[var(--r)]',
          'sm:max-w-[380px] sm:rounded-[var(--r)]',
        )}
      >
        <h4 className="font-display text-[20px] font-semibold m-0">{title}</h4>
        {subtitle && <p className="text-ink-2 text-[13.5px] mt-1 mb-0 leading-relaxed">{subtitle}</p>}
        <div className="mt-4">{children}</div>
        {footer && <div className="flex items-center justify-between gap-2.5 mt-5">{footer}</div>}
      </div>
    </div>
  );
}
