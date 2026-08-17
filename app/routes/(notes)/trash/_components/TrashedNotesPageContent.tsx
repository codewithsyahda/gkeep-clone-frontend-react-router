import { useQueryClient } from '@tanstack/react-query';
import { FileX2Icon } from 'lucide-react';
import { useLocation } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Spinner from '~/components/Spinner';
import SidebarContentAlertContainer from '~/routes/_components/SidebarContentAlertContainer';
import DialogConfirmation from '../../_components/DialogConfirmation';
import TrashedNoteCard from '../../_components/NoteCard/TrashedNoteCard';

import envConfig from '~/configs/envs';
import useBoolean from '~/hooks/useBoolean';
import useSelectionNotesCtx from '~/hooks/useSelectionNotesCtx';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';

const isLocalDev =
  import.meta.env.DEV &&
  !envConfig.dev.mock.msw &&
  import.meta.env.STORYBOOK !== true &&
  import.meta.env.MODE === 'development';

const useDeleteNotes = (
  await (isLocalDev
    ? import('~/hooks/react-query/notes/__mocks__/useDeleteNotes')
    : import('~/hooks/react-query/notes/useDeleteNotes'))
).default;

const useGetNotes = (
  await (isLocalDev
    ? import('~/hooks/react-query/notes/__mocks__/useGetNotes')
    : import('~/hooks/react-query/notes/useGetNotes'))
).default;

export default function TrashNotesPageContent() {
  const queryClient = useQueryClient();
  const deleteNotesMut = useDeleteNotes();

  const {
    value: isOpenDialogEmptyAll,
    setFalse: setIsCloseDialogEmptyAll,
    setTrue: setIsOpenDialogEmptyAll,
  } = useBoolean(false);

  const { isFetchedAfterMount, data } = useGetNotes({
    filters: {
      status: {
        isTrashed: true,
      },
    },
    queryOptions: {
      refetchOnMount: true,
    },
  });

  const notes = data?.notes.trash ?? [];

  const location = useLocation();

  const modalName = location.hash.slice(1).split('/')[0].toLowerCase();

  const openNoteDetailModal = modalName === 'notes';

  const handleCloseDialogEmptyAll = () => {
    if (deleteNotesMut.isPending) return;
    setIsCloseDialogEmptyAll();
  };

  const handleEmptyAll = async () => {
    if (deleteNotesMut.isPending) return;

    try {
      await deleteNotesMut.mutateAsync();

      await queryClient.invalidateQueries({
        queryKey: ['notes', { isTrashed: true }],
      });

      setIsCloseDialogEmptyAll();

      emitSnackbarAlert({
        alertText: 'All notes deleted',
      });
    } catch {
      emitSnackbarAlert({
        alertText: 'Deleting all notes failed',
      });
    }
  };

  const selectionNotesCtx = useSelectionNotesCtx();

  return (
    <>
      {!isFetchedAfterMount && (
        <SidebarContentAlertContainer>
          <Spinner size={36} />
        </SidebarContentAlertContainer>
      )}
      {isFetchedAfterMount && (
        <>
          {notes.length === 0 && (
            <SidebarContentAlertContainer>
              <Typography
                sx={{
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  py: 1,
                  px: 2,
                }}
              >
                Trashed notes appear here.
              </Typography>
            </SidebarContentAlertContainer>
          )}
          {notes.length !== 0 && (
            <>
              <Stack
                spacing={4}
                sx={{
                  alignItems: 'center',
                }}
              >
                <Typography
                  sx={{
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    py: 1,
                    px: 2,
                    maxWidth: 'max-content',
                  }}
                >
                  Notes in Trash are deleted after 7 days.
                </Typography>
                <Grid
                  spacing={2}
                  sx={{
                    pb: 12,
                    minHeight: '100%',
                    width: '100%',
                  }}
                  container
                >
                  {[...notes]
                    .sort(
                      (a, b) =>
                        Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
                    )
                    .map((n) => (
                      <Grid
                        key={n.id}
                        size={{
                          xs: 12,
                          lg: 6,
                        }}
                      >
                        <TrashedNoteCard
                          noteId={n.id}
                          noteTitle={n.title}
                          jsonContent={n.jsonContent}
                          updatedAt={n.updatedAt}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Stack>
              {selectionNotesCtx.notes.length === 0 && (
                <Button
                  variant="contained"
                  onClick={() => setIsOpenDialogEmptyAll()}
                  style={{
                    display:
                      openNoteDetailModal ||
                      notes.length === 0 ||
                      isOpenDialogEmptyAll
                        ? 'none'
                        : undefined,
                  }}
                  startIcon={
                    <Box
                      component={FileX2Icon}
                      sx={{
                        width: 16,
                        height: 16,
                      }}
                    />
                  }
                  sx={{
                    position: 'fixed',
                    bottom: {
                      xs: 16,
                      md: 20,
                    },
                    right: {
                      xs: 16,
                      md: 24,
                    },
                  }}
                >
                  Empty all
                </Button>
              )}
              <DialogConfirmation
                title="Empty trash?"
                content="All notes in Trash will be permanently deleted."
                slotProps={{
                  rootDialog: {
                    open: isOpenDialogEmptyAll,
                    onClose: handleCloseDialogEmptyAll,
                    'aria-labelledby': 'alert-dialog-empty-all-title',
                    'aria-describedby': 'alert-dialog-empty-all-description',
                  },
                  dialogTitle: {
                    id: 'alert-dialog-empty-all-title',
                  },
                  dialogContent: {
                    id: 'alert-dialog-empty-all-description',
                  },
                  noButton: {
                    disabled:
                      deleteNotesMut.isPending || deleteNotesMut.isSuccess,
                    onClick: handleCloseDialogEmptyAll,
                  },
                  yesButton: {
                    disabled:
                      deleteNotesMut.isPending || deleteNotesMut.isSuccess,
                    loading: deleteNotesMut.isPending,
                    onClick: handleEmptyAll,
                  },
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
