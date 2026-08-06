import { useEditor } from '@tiptap/react';
import { clsx } from 'clsx';

import DialogNoteDetailContainer from './DialogNoteDetailContainer';

import tiptapConfig from '~/configs/tiptap';
import type { TNoteStatus } from '~/types/models/notes';

export default function DialogNoteDetailEditorInitializer({
  noteId,
  noteTitle,
  noteContent,
  noteStatus,
  isTrashed,
  updatedAt,
}: Readonly<{
  noteId: string;
  noteTitle: string;
  noteContent: string;
  noteStatus: TNoteStatus;
  isTrashed: boolean;
  updatedAt: string;
}>) {
  const noteEditor = useEditor({
    extensions: tiptapConfig.extensions,
    content: JSON.parse(noteContent),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: clsx(tiptapConfig.defaultStyle, 'pb-80'),
        role: 'textbox',
        'aria-label': 'Content note',
      },
    },
  });

  if (!noteEditor) return null;

  return (
    <DialogNoteDetailContainer
      noteId={noteId}
      noteEditor={noteEditor}
      noteTitle={noteTitle}
      noteStatus={noteStatus}
      isTrashed={isTrashed}
      updatedAt={updatedAt}
    />
  );
}
