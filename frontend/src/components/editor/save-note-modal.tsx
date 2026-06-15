'use client';

import { useState } from 'react';
import type { Folder } from '@nenap/types';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Tag } from '@/components/ui/tag';
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

/** Organise-on-save: choose a folder (one per note) and add cross-cutting tags. */
export function SaveNoteModal({
  open,
  onClose,
  folders,
  initialFolderId = null,
  initialTags = [],
  saving,
  onConfirm,
}: SaveNoteModalProps) {
  const [folderId, setFolderId] = useState<string | null>(initialFolderId);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState('');

  function addTag() {
    const name = tagInput.trim();
    if (name && !tags.includes(name)) setTags([...tags, name]);
    setTagInput('');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save note"
      subtitle="Tuck it into a folder and add tags — or just save."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm({ folderId, tagNames: tags })} disabled={saving}>
            {saving ? 'Saving…' : 'Save note'}
          </Button>
        </>
      }
    >
      <label className="block text-[12px] font-semibold text-ink-2 mb-1.5">Folder</label>
      <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto">
        <FolderRow label="No folder" active={folderId === null} onClick={() => setFolderId(null)} />
        {folders.map((f) => (
          <FolderRow
            key={f.id}
            label={f.name}
            active={folderId === f.id}
            onClick={() => setFolderId(f.id)}
          />
        ))}
      </div>

      <label className="block text-[12px] font-semibold text-ink-2 mt-3.5 mb-1.5">Tags</label>
      <input
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
          }
        }}
        placeholder="Type a tag, press Enter"
        className="w-full font-ui text-sm text-ink bg-surface border border-line-2 rounded-sm px-3 py-2.5 outline-none focus-ring placeholder:text-ink-3"
      />
      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
          {tags.map((t) => (
            <button key={t} type="button" onClick={() => setTags(tags.filter((x) => x !== t))} title="Remove">
              <Tag label={`${t} ✕`} />
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

function FolderRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 border rounded-sm transition-colors text-left text-sm',
        active ? 'border-accent bg-accent-tint text-ink' : 'border-line-2 text-ink-2 hover:border-ink-3',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'ml-auto w-[17px] h-[17px] rounded-full border flex-none',
          active ? 'border-accent border-[5px]' : 'border-line-2 border-[1.6px]',
        )}
      />
    </button>
  );
}
