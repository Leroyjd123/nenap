'use client';

import { useState } from 'react';
import type { Folder } from '@nenap/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Icon } from '@/components/ui/icon';
import { useTags } from '@/lib/queries';
import { cn } from '@/lib/cn';

interface SaveNoteModalProps {
  open: boolean;
  onClose: () => void;
  folders: Folder[];
  initialFolderId?: string | null;
  initialTags?: string[];
  saving?: boolean;
  onConfirm: (data: { folderId: string | null; tagNames: string[] }) => void;
}

/** Organise-on-save: one folder per note + cross-cutting tags (Hi-Fi save-note modal). */
export function SaveNoteModal({
  open,
  onClose,
  folders,
  initialFolderId = null,
  initialTags = [],
  saving,
  onConfirm,
}: SaveNoteModalProps) {
  const existingTags = useTags();
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  const toggle = (name: string) =>
    setTags((x) => (x.includes(name) ? x.filter((y) => y !== name) : [...x, name]));

  function addTag() {
    const name = tagInput.trim();
    if (name && !tags.includes(name)) setTags([...tags, name]);
    setTagInput('');
  }

  // Union of the user's existing tags and any just-added, so all show as chips.
  const chipTags = Array.from(new Set([...(existingTags.data?.map((t) => t.name) ?? []), ...tags]));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save note"
      subtitle="Tuck it into a folder and add tags — or just save."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => onConfirm({ folderId, tagNames: tags })} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <label className="field-lab">Folder</label>
      <div style={{ maxHeight: 180, overflowY: 'auto' }}>
        <div className={cn('opt-row', folderId === null && 'on')} onClick={() => setFolderId(null)}>
          <Icon name="folder" size={17} style={{ color: 'var(--ink-3)' }} />
          <span style={{ fontWeight: 500 }}>No folder</span>
          <span className="rad" />
        </div>
        {folders.map((f) => (
          <div key={f.id} className={cn('opt-row', folderId === f.id && 'on')} onClick={() => setFolderId(f.id)}>
            <Icon name="folder" size={17} style={{ color: 'var(--accent)' }} />
            <span style={{ fontWeight: 500 }}>{f.name}</span>
            <span className="rad" />
          </div>
        ))}
      </div>

      <label className="field-lab">Tags</label>
      <div className="row wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {chipTags.map((t) => (
          <span key={t} className={cn('chip', tags.includes(t) && 'on')} onClick={() => toggle(t)}>
            {t}
          </span>
        ))}
      </div>
      <input
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder="Add a tag, press Enter"
        className="input"
        style={{ marginTop: 8 }}
      />
    </Modal>
  );
}
