'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** On-brand confirmation dialog — replaces window.confirm(). */
export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  busy,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={body}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            loading={busy}
            // Solid clay for destructive actions, matching the Hi-Fi delete modal.
            style={destructive ? { background: 'var(--rec)', color: '#fff', boxShadow: 'none', borderColor: 'var(--rec)' } : undefined}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
