import { useMemo, useState, type ReactNode } from 'react';

import type { TNoteStatus } from '~/types/models/notes';
import { NotesSelectionContext } from './reactContext';

export default function NotesSelectionCtxProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [notes, setNotes] = useState<
    {
      noteId: string;
      noteStatus: TNoteStatus | undefined;
      isTrashed: boolean;
    }[]
  >(() => []);

  const selectOne = (note: {
    noteId: string;
    noteStatus: TNoteStatus | undefined;
    isTrashed: boolean;
  }) => {
    setNotes((prevValue) => [...prevValue, note]);
  };

  const unselectOne = (noteId: string) => {
    setNotes((prevValue) => prevValue.filter((n) => n.noteId !== noteId));
  };

  const unselectAll = () => {
    setNotes(() => []);
  };

  const ctxValue = useMemo(
    () => ({
      notes,
      selectOne,
      unselectOne,
      unselectAll,
    }),
    [notes],
  );

  return (
    <NotesSelectionContext value={ctxValue}>{children}</NotesSelectionContext>
  );
}
