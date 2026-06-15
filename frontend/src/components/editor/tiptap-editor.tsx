'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Minimal markdown-style rich-text editor (Tiptap + StarterKit), styled with the
 * Hi-Fi `.prose` look. Chrome stays invisible — the note is the product.
 */
export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false, // avoids Next SSR hydration mismatch
    editorProps: {
      attributes: {
        class:
          'prose-nenap font-display text-[16px] leading-[1.62] text-ink outline-none min-h-[320px]',
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  // Keep editor content in sync when an async-loaded note arrives.
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, content]);

  return <EditorContent editor={editor} />;
}
