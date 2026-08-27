import { useQueryClient } from '@tanstack/react-query';
import { useState, type MouseEvent, type MouseEventHandler } from 'react';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { EllipsisVerticalIcon, XIcon } from 'lucide-react';

import DialogConfirmation from '../../../../DialogConfirmation';
import AppTopIconButtonBase from './AppTopIconButtonBase';

import useDeleteNoteByIds from '~/hooks/react-query/notes/useDeleteNoteByIds';
import usePatchNoteById from '~/hooks/react-query/notes/usePatchNoteById';
import useBoolean from '~/hooks/useBoolean';
import useNotesSelectionCtx from '~/hooks/useNotesSelectionCtx';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';

export default function AppTopNotesSelectionBar() {
  const [anchorSelectionBtnElem, setAnchorSelectionBtnElem] =
    useState<null | HTMLElement>(null);

  const handleOpenSelectionMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorSelectionBtnElem(event.currentTarget);
  };

  const handleCloseSelectionMenu = () => {
    setAnchorSelectionBtnElem(null);
  };

  const notesSelectionCtx = useNotesSelectionCtx();

  const isSelectedTrashedNotes =
    notesSelectionCtx.notes.filter((n) => n.isTrashed).length > 0;

  const isSelectedActiveNotes =
    !isSelectedTrashedNotes &&
    notesSelectionCtx.notes.filter((n) => n.noteStatus === 'active').length > 0;

  const isSelectedArchivedNotes =
    !isSelectedTrashedNotes &&
    notesSelectionCtx.notes.filter((n) => n.noteStatus === 'archived').length >
      0;

  const totalNotesSelection = notesSelectionCtx.notes.length;

  const queryClient = useQueryClient();

  const patchNoteByIdMut = usePatchNoteById();
  const deleteNoteByIdsMut = useDeleteNoteByIds();

  const disableSelectedActionBtn =
    patchNoteByIdMut.isPending || deleteNoteByIdsMut.isPending;

  const handleActionSelectedNotes: MouseEventHandler<HTMLLIElement> = async (
    ev,
  ) => {
    const evTarget = ev.currentTarget;

    const actionName = evTarget.dataset.actionName as
      | 'archive'
      | 'unarchive'
      | 'trash'
      | 'restore';

    let alertTextSuccess = '';
    let alertTextError = '';

    if (actionName === 'archive') {
      alertTextSuccess =
        totalNotesSelection > 1
          ? `${totalNotesSelection} notes archived`
          : 'Note archived';
      alertTextError =
        totalNotesSelection > 1
          ? `Archiving${totalNotesSelection} notes failed`
          : 'Archiving note failed';
    } else if (actionName === 'unarchive') {
      alertTextSuccess =
        totalNotesSelection > 1
          ? `${totalNotesSelection} notes unarchive`
          : 'Note unarchive';
      alertTextError =
        totalNotesSelection > 1
          ? `Unarchiving ${totalNotesSelection} notes failed`
          : 'Unarchive note failed';
    } else if (actionName === 'trash') {
      alertTextSuccess =
        totalNotesSelection > 1
          ? `${totalNotesSelection} notes trashed`
          : 'Note trashed';
      alertTextError =
        totalNotesSelection > 1
          ? `Trashing ${totalNotesSelection} notes failed`
          : 'Trashing note failed';
    } else {
      alertTextSuccess =
        totalNotesSelection > 1
          ? `${totalNotesSelection} notes restored`
          : 'Note restored';
      alertTextError =
        totalNotesSelection > 1
          ? `Restoring ${totalNotesSelection} notes failed`
          : 'Restoring note failed';
    }

    try {
      if (actionName === 'archive' || actionName === 'unarchive') {
        await Promise.all(
          notesSelectionCtx.notes.map((n) =>
            patchNoteByIdMut.mutateAsync({
              noteId: n.noteId,
              data: {
                status: actionName === 'archive' ? 'archived' : 'active',
              },
            }),
          ),
        );
      } else {
        await Promise.all(
          notesSelectionCtx.notes.map((n) =>
            patchNoteByIdMut.mutateAsync({
              noteId: n.noteId,
              data: { isTrashed: actionName === 'trash' },
            }),
          ),
        );
      }

      emitSnackbarAlert({
        alertText: alertTextSuccess,
      });
    } catch {
      emitSnackbarAlert({
        alertText: alertTextError,
        alertSeverity: 'error',
      });
    }

    setAnchorSelectionBtnElem(null);

    notesSelectionCtx.unselectAll();

    queryClient.invalidateQueries({
      queryKey: ['notes'],
    });
  };

  const {
    value: isOpenDialogDeleteSelectedNotes,
    setTrue: setOpenDialogDeleteSelectedNotes,
    setFalse: setCloseDialogDeleteSelectedNotes,
  } = useBoolean(false);

  const handleDeleteSelectedNotes = async () => {
    try {
      await deleteNoteByIdsMut.mutateAsync(
        notesSelectionCtx.notes.map((n) => n.noteId),
      );

      emitSnackbarAlert({
        alertText:
          totalNotesSelection > 1
            ? `${totalNotesSelection} notes deleted`
            : 'Note deleted',
        alertSeverity: 'success',
      });
    } catch {
      emitSnackbarAlert({
        alertText:
          totalNotesSelection > 1
            ? `Deleting ${totalNotesSelection} notes failed`
            : 'Deleting note failed',
        alertSeverity: 'error',
      });
    }

    setCloseDialogDeleteSelectedNotes();

    notesSelectionCtx.unselectAll();

    setAnchorSelectionBtnElem(null);

    queryClient.invalidateQueries({
      queryKey: ['notes'],
    });
  };

  const handleCloseDialogDeleteSelectedNotes = () => {
    if (deleteNoteByIdsMut.isPending) return;

    setCloseDialogDeleteSelectedNotes();
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 1,
            md: 2,
          }}
        >
          <div>
            <AppTopIconButtonBase
              onClick={notesSelectionCtx.unselectAll}
              sx={{
                p: 2,
              }}
              disableRipple
            >
              <XIcon aria-hidden="true" />{' '}
              <Typography className="sr-only">Clear all selection</Typography>
            </AppTopIconButtonBase>
          </div>
          <Typography variant="h6" component="p">
            {totalNotesSelection} selected
          </Typography>
        </Stack>
        <div>
          <AppTopIconButtonBase
            aria-haspopup="true"
            aria-controls={
              anchorSelectionBtnElem ? 'selection-actions-menu' : undefined
            }
            aria-expanded={anchorSelectionBtnElem ? 'true' : undefined}
            sx={{
              p: 2,
            }}
            onClick={handleOpenSelectionMenu}
            disableRipple
          >
            <EllipsisVerticalIcon aria-hidden="true" />{' '}
            <Typography className="sr-only">Selection menu</Typography>
          </AppTopIconButtonBase>
        </div>
        <Menu
          id="selection-actions-menu"
          anchorEl={anchorSelectionBtnElem}
          open={Boolean(anchorSelectionBtnElem)}
          onClose={handleCloseSelectionMenu}
          slotProps={{
            backdrop: {
              component: 'button',
              'aria-label': 'Close selection actions menu',
              'aria-hidden': 'false',
            },
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '&>.MuiMenu-paper': {
              minWidth: 148,
            },
          }}
        >
          {(isSelectedActiveNotes ||
            (isSelectedActiveNotes && isSelectedArchivedNotes)) && (
            <MenuItem
              data-action-name="archive"
              disabled={disableSelectedActionBtn}
              onClick={handleActionSelectedNotes}
            >
              Archive
            </MenuItem>
          )}
          {(isSelectedArchivedNotes ||
            (isSelectedActiveNotes && isSelectedArchivedNotes)) && (
            <MenuItem
              data-action-name="unarchive"
              disabled={disableSelectedActionBtn}
              onClick={handleActionSelectedNotes}
            >
              Unarchive
            </MenuItem>
          )}
          {(isSelectedActiveNotes || isSelectedArchivedNotes) && (
            <MenuItem
              data-action-name="trash"
              disabled={disableSelectedActionBtn}
              onClick={handleActionSelectedNotes}
            >
              Trash
            </MenuItem>
          )}
          {isSelectedTrashedNotes && (
            <MenuItem
              data-action-name="restore"
              disabled={disableSelectedActionBtn}
              onClick={handleActionSelectedNotes}
            >
              Restore
            </MenuItem>
          )}
          {isSelectedTrashedNotes && (
            <MenuItem
              disabled={disableSelectedActionBtn}
              onClick={setOpenDialogDeleteSelectedNotes}
            >
              Delete
            </MenuItem>
          )}
        </Menu>
      </Stack>
      <DialogConfirmation
        title="Are you sure?"
        content={
          totalNotesSelection > 1
            ? `The ${totalNotesSelection} notes will be permanently deleted`
            : 'The note will be permanently deleted.'
        }
        slotProps={{
          rootDialog: {
            open: isOpenDialogDeleteSelectedNotes,
            onClose: handleCloseDialogDeleteSelectedNotes,
            'aria-labelledby': 'alert-dialog-delete-selected-note-title',
            'aria-describedby': 'alert-dialog-delete-selected-note-description',
          },
          dialogTitle: {
            id: 'alert-dialog-delete-selected-note-title',
          },
          dialogContent: {
            id: 'alert-dialog-delete-selected-note-description',
          },
          noButton: {
            disabled: deleteNoteByIdsMut.isPending,
            onClick: handleCloseDialogDeleteSelectedNotes,
          },
          yesButton: {
            loading: deleteNoteByIdsMut.isPending,
            onClick: handleDeleteSelectedNotes,
          },
        }}
      />
    </>
  );
}
