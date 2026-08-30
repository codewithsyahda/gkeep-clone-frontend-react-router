import { use } from 'react';

import { NotesSelectionContext } from '~/contexts/reactContext';

const useNotesSelectionCtx = () => {
  const ctx = use(NotesSelectionContext);

  if (!ctx) throw new Error('Cannot use the context outside the provider');

  return ctx;
};

export default useNotesSelectionCtx;
