import type { Decorator } from '@storybook/react-vite';

import {
  SelectionNotesContext,
  type TNotesSelectionContext,
} from '~/contexts/reactContext';
import SelectionNotesCtxProvider from '~/contexts/SelectionNotesCtxProvider';

const notesSelectionDecorator: Decorator = (Story, context) => {
  const mockedCtxValue =
    (context.parameters?.notesSelection?.mockedCtxValue as
      | Partial<TNotesSelectionContext>
      | undefined) ?? {};

  const isMocked =
    !!mockedCtxValue.notes ||
    !!mockedCtxValue.selectOne ||
    !!mockedCtxValue.unselectOne ||
    !!mockedCtxValue.unselectAll;

  if (isMocked) {
    return (
      <SelectionNotesContext
        value={{
          notes: [],
          selectOne: () => {},
          unselectOne: () => {},
          unselectAll: () => {},
          ...mockedCtxValue,
        }}
      >
        <Story />
      </SelectionNotesContext>
    );
  }

  return (
    <SelectionNotesCtxProvider>
      <Story />
    </SelectionNotesCtxProvider>
  );
};

export default notesSelectionDecorator;
