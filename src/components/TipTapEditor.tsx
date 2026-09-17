import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface TipTapEditorProps {
  initialContent: string;
  onSave: (html: string) => void;
  onCancel?: () => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
  onSave,
  onCancel,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: initialContent || '<p></p>',
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'shared-typography outline-none focus:outline-none min-h-[1lh]',
      },
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      onSave(html);
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (editor) {
          onSave(editor.getHTML());
        } else if (onCancel) {
          onCancel();
        }
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (editor) {
          onSave(editor.getHTML());
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor, onSave, onCancel]);

  return (
    <div className="nodrag nopan w-full m-0 p-0 border-0 outline-none cursor-text">
      <EditorContent editor={editor} className="m-0 p-0 border-0 outline-none" />
    </div>
  );
};
