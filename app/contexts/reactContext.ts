import { createContext } from 'react';

import type { TNoteStatus } from '~/types/models/notes';

export const SelectionNotesContext = createContext<
  | {
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
    }
  | undefined
>(undefined);
