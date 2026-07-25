import { useContext } from 'react';

import { SelectionNotesContext } from '~/contexts/reactContext';

const useSelectionNotesCtx = () => {
  const ctx = useContext(SelectionNotesContext);

  if (!ctx) throw new Error('Cannot use the context outside the provider');

  return ctx;
};

export default useSelectionNotesCtx;
