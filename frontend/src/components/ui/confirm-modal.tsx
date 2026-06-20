'use client';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
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
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            variant={destructive ? 'rec' : 'primary'}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </>
      }
    >
      <span className="sr-only">{body}</span>
    </Modal>
  );
}
