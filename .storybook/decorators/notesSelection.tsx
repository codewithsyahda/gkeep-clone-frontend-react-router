import type { Decorator } from '@storybook/react-vite';

import NotesSelectionCtxProvider from '~/contexts/NotesSelectionCtxProvider';
import {
  NotesSelectionContext,
  type TNotesSelectionContext,
} from '~/contexts/reactContext';

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
      <NotesSelectionContext
        value={{
          notes: [],
          selectOne: () => {},
          unselectOne: () => {},
          unselectAll: () => {},
          ...mockedCtxValue,
        }}
      >
        <Story />
      </NotesSelectionContext>
    );
  }

  return (
    <NotesSelectionCtxProvider>
      <Story />
    </NotesSelectionCtxProvider>
  );
};

export default notesSelectionDecorator;
