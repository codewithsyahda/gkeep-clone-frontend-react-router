import { useQueryClient } from '@tanstack/react-query';
import { Editor } from '@tiptap/react';
import { FileX2Icon, Maximize, PanelTopCloseIcon, XIcon } from 'lucide-react';
import { type MouseEventHandler } from 'react';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Spinner from '~/components/Spinner';
import DialogConfirmation from '../../../DialogConfirmation';
import ButtonDialogNoteAction from '../../_internal-components/ButtonDialogNoteAction';
import DialogNoteActionContainer from '../../_internal-components/DialogNoteActionContainer';
import DialogNoteContainer from '../../_internal-components/DialogNoteContainer';
import NoteEditor from '../../_internal-components/NoteEditor';
import ButtonNoteInfo from './ButtonNoteInfo';
import DialogNoteDetailInfo from './DialogNoteDetailInfo';

import useDeleteNoteById from '~/hooks/react-query/notes/useDeleteNoteById';
import useBoolean from '~/hooks/useBoolean';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import type { TNoteStatus } from '~/types/models/notes';
import formatDate from '~/utils/formatDate';
import useDialogFullScreen from '../../_internal-hooks/useDialogFullScreen';

export default function DialogNoteDetailTrashed({
  noteEditor,
  isRestoringNote,
  titleValue,
  noteId,
  noteStatus,
  isTrashed,
  updatedAt,
  handleUpdateNonContentNote,
  handleCloseDialog,
}: Readonly<{
  noteEditor: Editor;
  isRestoringNote: boolean;
  titleValue: string;
  noteId: string;
  noteStatus: TNoteStatus;
  isTrashed: boolean;
  updatedAt: string;
  handleUpdateNonContentNote: MouseEventHandler<HTMLButtonElement>;
  handleCloseDialog: MouseEventHandler<HTMLButtonElement>;
}>) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const deleteNoteMut = useDeleteNoteById();

  const handleDeleteNote = async () => {
    if (deleteNoteMut.isPending) return;

    try {
      await deleteNoteMut.mutateAsync(noteId);

      await navigate({ hash: '' });

      emitSnackbarAlert({
        alertText: 'Note deleted',
      });

      queryClient.invalidateQueries({
        queryKey: ['notes', { isTrashed: true }],
      });
    } catch {
      emitSnackbarAlert({
        alertText: 'Deleting note failed',
        alertSeverity: 'error',
      });
    }
  };

  const { fullScreen, handleToggleFullScreen } = useDialogFullScreen();

  const {
    value: isOpenInfo,
    toggleValue: handleToggleOpenInfo,
    setFalse: setOpenInfoFalse,
  } = useBoolean(false);

  const {
    value: isOpenDialogDeleteNote,
    setFalse: handleCloseDialogDeleteNote,
    setTrue: handleOpenDialogDeleteNote,
  } = useBoolean(false);

  return (
    <>
      <DialogNoteContainer
        type="detail-note"
        fullScreen={fullScreen}
        onClose={handleCloseDialog}
        bodySection={
          <NoteEditor
            noteEditor={noteEditor}
            titleValue={titleValue}
            onInputTitle={() => {}}
            disabledInputTitle
          />
        }
        actionSection={
          <DialogNoteActionContainer>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },
                }}
              >
                <ButtonDialogNoteAction
                  tooltipTitle="Fullscreen"
                  onClick={handleToggleFullScreen}
                >
                  <Maximize className="size-4" />
                </ButtonDialogNoteAction>
              </Box>
              <Box
                sx={{
                  display: {
                    md: 'none',
                  },
                  position: 'relative',
                }}
              >
                <ButtonNoteInfo
                  setClose={setOpenInfoFalse}
                  handleToggle={handleToggleOpenInfo}
                />
                {isOpenInfo && (
                  <DialogNoteDetailInfo
                    noteStatus={noteStatus}
                    isTrashed={isTrashed}
                    updatedAt={updatedAt}
                  />
                )}
              </Box>
              <ButtonDialogNoteAction
                data-update-non-content-action="restore"
                tooltipTitle="Restore"
                disabled={
                  isRestoringNote ||
                  deleteNoteMut.isPending ||
                  deleteNoteMut.isSuccess
                }
                onClick={handleUpdateNonContentNote}
                aria-label="Restore"
              >
                {isRestoringNote ? (
                  <Spinner />
                ) : (
                  <PanelTopCloseIcon className="size-4" />
                )}
              </ButtonDialogNoteAction>
              <ButtonDialogNoteAction
                tooltipTitle="Delete"
                disabled={
                  isRestoringNote ||
                  deleteNoteMut.isPending ||
                  deleteNoteMut.isSuccess
                }
                onClick={handleOpenDialogDeleteNote}
                aria-label="Delete"
              >
                {deleteNoteMut.isPending || deleteNoteMut.isSuccess ? (
                  <Spinner />
                ) : (
                  <FileX2Icon className="size-4" />
                )}
              </ButtonDialogNoteAction>
              <Chip
                label="Trashed"
                color="secondary"
                sx={(theme) => ({
                  [theme.breakpoints.down(355)]: {
                    display: 'none',
                  },
                })}
              />
              <Box
                sx={(theme) => ({
                  [theme.breakpoints.down('sm')]: {
                    display: 'none',
                  },
                })}
              >
                <Typography variant="body2">
                  Last edited{' • '}
                  {formatDate(updatedAt)}
                </Typography>
              </Box>
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                flex: 1,
                justifyContent: 'flex-end',
              }}
            >
              <Tooltip title="Close">
                <Button
                  variant="outlined"
                  color="inherit"
                  disabled={
                    isRestoringNote ||
                    deleteNoteMut.isPending ||
                    deleteNoteMut.isSuccess
                  }
                  onClick={handleCloseDialog}
                >
                  <XIcon className="size-4" />
                </Button>
              </Tooltip>
            </Stack>
          </DialogNoteActionContainer>
        }
      />
      <DialogConfirmation
        title="Are you sure?"
        content="The note will be permanently deleted."
        slotProps={{
          rootDialog: {
            open: isOpenDialogDeleteNote,
            onClose: handleCloseDialogDeleteNote,
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
            onClick: handleCloseDialogDeleteNote,
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
