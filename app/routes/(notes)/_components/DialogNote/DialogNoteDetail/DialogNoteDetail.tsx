import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { FocusTrap } from 'focus-trap-react';

import OverlayScreen from '~/components/OverlayScreen';
import Spinner from '~/components/Spinner';
import DialogNoteDetailEditorInitializer from './_internal-components/DialogNoteDetailEditorInitializer';

import ResponseError from '~/exceptions/responseError';
import useGetNoteById from '~/hooks/react-query/notes/useGetNoteById';

export default function DialogNoteDetail({
  onClose,
}: Readonly<{
  onClose: () => void;
}>) {
  const navigate = useNavigate();
  const location = useLocation();

  const noteId = location.hash.slice(1).split('/')[1]?.toLowerCase() || '';

  const { isFetchedAfterMount, error, data } = useGetNoteById({
    noteId,
    queryOptions: {
      enabled: noteId !== '',
      refetchOnMount: true,
      retry: false,
    },
  });

  useHotkeys('escape', onClose, {
    enableOnFormTags: ['textbox'],
    enableOnContentEditable: true,
  });

  /**
   * The useEffect code below redirects to the note page
   * (active, archived, or trashed page) when the URL
   * path is /notes/ without a note ID.
   */
  useEffect(() => {
    if (!noteId)
      navigate({
        hash: '',
        search: location.search,
      });
  }, [location.search, navigate, noteId]);

  if (!noteId) return null;

  if (!isFetchedAfterMount || error || !data) {
    return (
      <FocusTrap
        focusTrapOptions={{
          escapeDeactivates: false,
        }}
      >
        <Stack
          sx={(theme) => ({
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100svh',
            width: '100%',
            zIndex: theme.zIndex.drawer + 1,
          })}
        >
          {!isFetchedAfterMount && (
            <Box
              sx={{
                color: 'common.white',
                position: 'relative',
                zIndex: 1,
                '& > *': {
                  height: 36,
                  width: 36,
                },
              }}
            >
              <Spinner size={36} label="Fetching note detail" />
            </Box>
          )}
          {error && (
            <Paper
              elevation={2}
              sx={{
                position: 'relative',
                minWidth: 280,
                zIndex: 1,
              }}
            >
              <Stack
                spacing={1}
                sx={{
                  p: 2,
                  pb: 1,
                }}
              >
                <Typography
                  sx={{
                    textAlign: 'center',
                  }}
                >
                  {error instanceof ResponseError ? (
                    <>
                      {error.status === 404 && 'Note is not found'}
                      {error.status === 500 && error.message}
                    </>
                  ) : (
                    error.message
                  )}
                </Typography>
                <Button
                  onClick={onClose}
                  sx={{
                    alignSelf: 'center',
                    maxWidth: 'max-content',
                  }}
                >
                  Dismiss
                </Button>
              </Stack>
            </Paper>
          )}
          <OverlayScreen
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: '100%',
            }}
          >
            <span className="sr-only">Close dialog</span>
          </OverlayScreen>
        </Stack>
      </FocusTrap>
    );
  }

  const {
    title,
    jsonContent: content,
    updatedAt,
    archivedAt,
    trashedAt,
  } = data.note;

  return (
    <DialogNoteDetailEditorInitializer
      noteId={noteId}
      noteTitle={title}
      noteContent={content}
      noteStatus={archivedAt ? 'archived' : 'active'}
      isTrashed={!!trashedAt}
      updatedAt={updatedAt}
      onClose={onClose}
    />
  );
}
