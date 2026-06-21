'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { useCreateFolder } from '@/lib/queries';

export function CreateFolderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const createFolder = useCreateFolder();
  const [name, setName] = useState('');

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      await createFolder.mutateAsync({ name: trimmed });
      toast.show('Folder created');
      setName('');
      onClose();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Could not create folder');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New folder"
      subtitle="Folders are gentle categories — College, Work, Ideas…"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={createFolder.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createFolder.isPending || !name.trim()}>
            {createFolder.isPending ? 'Creating…' : 'Create folder'}
          </Button>
        </>
      }
    >
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Folder name"
        maxLength={60}
      />
    </Modal>
  );
}
