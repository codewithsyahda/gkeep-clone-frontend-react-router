import { useQueryClient } from '@tanstack/react-query';
import {
  FileX2Icon,
  InfoIcon,
  PanelTopCloseIcon,
  SquareArrowOutUpRightIcon,
} from 'lucide-react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import Spinner from '~/components/Spinner';
import DialogConfirmation from '../DialogConfirmation';
import ButtonCardNoteAction from './_internal-components/ButtonCardNoteAction';
import ButtonLinkCardNoteAction from './_internal-components/ButtonLinkCardNoteAction';
import NoteCardContainer from './_internal-components/NoteCardContainer';
import NoteInfo from './_internal-components/NoteInfo';

import useDeleteNoteById from '~/hooks/react-query/notes/useDeleteNoteById';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import useNoteInfo from './_internal-hooks/useNoteInfo';
import useUpdateNoteByIdMut from './_internal-hooks/useUpdateNoteStatusByIdMut';

export default function TrashedNoteCard({
  noteId,
  noteTitle,
  jsonContent,
  updatedAt,
}: Readonly<{
  noteId: string;
  noteTitle: string;
  jsonContent: string;
  updatedAt: string;
}>) {
  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const queryClient = useQueryClient();

  const { patchNoteMut, handleUpdateNote } = useUpdateNoteByIdMut(noteId);

  const deleteNoteMut = useDeleteNoteById();

  const { openInfo, handleToggleOpenInfo } = useNoteInfo(noteId);

  const handleOpenDialog = () => setIsOpenDialog(() => true);

  const handleCloseDialog = () => {
    if (deleteNoteMut.isPending) return;

    setIsOpenDialog(() => false);
  };

  const handleDeleteNote = async () => {
    if (deleteNoteMut.isPending || deleteNoteMut.isSuccess) return;

    try {
      await deleteNoteMut.mutateAsync(noteId);

      await queryClient.invalidateQueries({
        queryKey: ['notes', { isTrashed: true }],
      });

      emitSnackbarAlert({
        alertText: 'Note deleted',
        alertSeverity: 'success',
      });
    } catch {
      emitSnackbarAlert({
        alertText: 'Deleting note failed',
        alertSeverity: 'error',
      });
    } finally {
      setIsOpenDialog(() => false);
    }
  };

  return (
    <>
      <NoteCardContainer
        noteTitle={noteTitle}
        jsonContent={jsonContent}
        actionSection={
          <Stack
            direction="row"
            sx={{
              borderTop: 1,
              borderColor: 'grey.300',
              justifyContent: 'space-between',
              p: 1,
            }}
          >
            <Stack direction="row" spacing={1}>
              <Box
                sx={{
                  position: 'relative',
                }}
              >
                <Tooltip title="Info">
                  <ButtonCardNoteAction
                    data-component={`note-${noteId}-info-btn`}
                    onClick={handleToggleOpenInfo}
                  >
                    <InfoIcon className="size-4" />
                  </ButtonCardNoteAction>
                </Tooltip>
                {openInfo && <NoteInfo updatedAt={updatedAt} />}
              </Box>
              <Tooltip title="Restore">
                <ButtonCardNoteAction
                  data-action="restore"
                  disabled={
                    patchNoteMut.isPending ||
                    patchNoteMut.isSuccess ||
                    deleteNoteMut.isPending ||
                    deleteNoteMut.isSuccess
                  }
                  onClick={handleUpdateNote}
                >
                  {patchNoteMut.isPending ? (
                    <Spinner />
                  ) : (
                    <PanelTopCloseIcon className="size-4" />
                  )}
                </ButtonCardNoteAction>
              </Tooltip>
              <Tooltip title="Delete">
                <ButtonCardNoteAction
                  disabled={
                    patchNoteMut.isPending ||
                    patchNoteMut.isSuccess ||
                    deleteNoteMut.isPending ||
                    deleteNoteMut.isSuccess
                  }
                  onClick={handleOpenDialog}
                >
                  {deleteNoteMut.isPending ? (
                    <Spinner />
                  ) : (
                    <FileX2Icon className="size-4" />
                  )}
                </ButtonCardNoteAction>
              </Tooltip>
            </Stack>
            <Tooltip title="See details">
              <ButtonLinkCardNoteAction
                to={{ pathname: '/trash', hash: `#notes/${noteId}` }}
                aria-label="Note detail"
              >
                <SquareArrowOutUpRightIcon className="size-4" />
              </ButtonLinkCardNoteAction>
            </Tooltip>
          </Stack>
        }
      />
      <DialogConfirmation
        title="Are you sure?"
        content="The note will be permanently deleted."
        slotProps={{
          rootDialog: {
            open: isOpenDialog,
            onClose: handleCloseDialog,
            'aria-labelledby': 'alert-dialog-delete-note-title',
            'aria-describedby': 'alert-dialog-delete-note-description',
          },
          dialogTitle: {
            id: 'alert-dialog-delete-note-title',
          },
          dialogContent: {
            id: 'alert-dialog-delete-note-description',
          },
          noButton: {
            disabled: deleteNoteMut.isPending || deleteNoteMut.isSuccess,
            onClick: handleCloseDialog,
          },
          yesButton: {
            loading: deleteNoteMut.isPending || deleteNoteMut.isSuccess,
            onClick: handleDeleteNote,
          },
        }}
      />
    </>
  );
}
