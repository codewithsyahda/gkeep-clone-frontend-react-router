import { createContext } from 'react';

import type { TNoteStatus } from '~/types/models/notes';

export type TNotesSelectionContext = {
  notes: {
    noteId: string;
    noteStatus: TNoteStatus | undefined;
    isTrashed: boolean;
  }[];
  selectOne: (note: {
    noteId: string;
    noteStatus: TNoteStatus | undefined;
    isTrashed: boolean;
  }) => void;
  unselectOne: (noteId: string) => void;
  unselectAll: () => void;
};

export const NotesSelectionContext = createContext<
  TNotesSelectionContext | undefined
>(undefined);
