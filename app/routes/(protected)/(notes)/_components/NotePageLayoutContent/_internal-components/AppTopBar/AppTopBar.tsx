import type { ChangeEventHandler, MouseEventHandler, RefObject } from 'react';

import Box from '@mui/material/Box';

import AppTopMainBar from './_internal-components/AppTopMainBar';
import AppTopNotesSelectionBar from './_internal-components/AppTopNotesSelectionBar';

import useNotesSelectionCtx from '~/hooks/useNotesSelectionCtx';

export default function AppTopBar({
  isShowSidebar,
  isSigningOut,
  isSignedOut,
  searchNotesQuery,
  session,
  searchNotesInputRootRef,
  handleToggleSidebar,
  handleSearchNotes,
  handleSignOut,
}: Readonly<{
  isShowSidebar: boolean;
  isSigningOut: boolean;
  isSignedOut: boolean;
  searchNotesQuery: string;
  session: {
    name: string;
    email: string;
  };
  searchNotesInputRootRef: RefObject<HTMLDivElement | null>;
  handleToggleSidebar: MouseEventHandler<HTMLButtonElement>;
  handleSearchNotes: ChangeEventHandler<HTMLInputElement>;
  handleSignOut: MouseEventHandler<HTMLButtonElement>;
}>) {
  const notesSelectionCtx = useNotesSelectionCtx();

  const totalNotesSelection = notesSelectionCtx.notes.length;

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderBottomColor: 'grey.300',
        p: 1,
        px: {
          sm: 2,
        },
        height: 75,
        position: 'relative',
      }}
    >
      {totalNotesSelection === 0 ? (
        <AppTopMainBar
          isShowSidebar={isShowSidebar}
          isSigningOut={isSigningOut}
          isSignedOut={isSignedOut}
          searchNotesQuery={searchNotesQuery}
          session={session}
          searchNotesInputRootRef={searchNotesInputRootRef}
          handleToggleSidebar={handleToggleSidebar}
          handleSearchNotes={handleSearchNotes}
          handleSignOut={handleSignOut}
        />
      ) : (
        <AppTopNotesSelectionBar />
      )}
    </Box>
  );
}
