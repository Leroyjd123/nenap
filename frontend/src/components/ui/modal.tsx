'use client';

import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  sheet?: boolean;
}

/** Hi-Fi modal (.scrim/.modal) — centered card, or bottom .sheet. Esc + scrim close. */
export function Modal({ open, onClose, title, subtitle, children, footer, sheet }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={cn('scrim', sheet && 'sheet-scrim')} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn('modal', sheet && 'sheet')}
      >
        <h4>{title}</h4>
        {subtitle && <p className="sub">{subtitle}</p>}
        {children}
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
