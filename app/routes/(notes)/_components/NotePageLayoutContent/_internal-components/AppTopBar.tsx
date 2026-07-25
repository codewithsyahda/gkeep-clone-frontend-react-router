import { useQueryClient } from '@tanstack/react-query';
import { EllipsisVerticalIcon, MenuIcon, XIcon } from 'lucide-react';
import type {
  ChangeEventHandler,
  MouseEvent,
  MouseEventHandler,
  RefObject,
} from 'react';
import { useEffect, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useLocation } from 'react-router';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import Typography from '@mui/material/Typography';

import AppBrandLogo from '~/routes/_components/AppBrandLogo';
import DialogConfirmation from '../../DialogConfirmation';
import UserMenu from './UserMenu';

import useDeleteNoteByIds from '~/hooks/react-query/notes/useDeleteNoteByIds';
import usePatchNoteById from '~/hooks/react-query/notes/usePatchNoteById';
import useBoolean from '~/hooks/useBoolean';
import useSelectionNotesCtx from '~/hooks/useSelectionNotesCtx';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';

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
  const location = useLocation();

  /**
   * The useEffect code below synchronizes the search notes
   * input element value to the search-notes query param.
   *
   * Specific edge case:
   * Removes the search notes input element value when
   * navigating to other page note (active, archived, or
   * trashed note page.)
   */
  useEffect(() => {
    const searchNotesInputRoot = searchNotesInputRootRef.current;

    if (!searchNotesInputRoot) return;

    const searchNotesInput = searchNotesInputRoot.querySelector(
      '.MuiOutlinedInput-input',
    ) as HTMLInputElement;

    if (!new URLSearchParams(location.search).get('search-notes')) {
      searchNotesInput.value = '';
    }
  }, [location.search, searchNotesInputRootRef]);

  const theme = useTheme();

  const isMdUpBreakpoint = useMediaQuery(theme.breakpoints.up('md'));

  useHotkeys(
    'Slash',
    () => {
      const searchNotesInputRoot = searchNotesInputRootRef.current;

      if (isMdUpBreakpoint && searchNotesInputRoot && location.hash === '') {
        (
          searchNotesInputRoot.querySelector(
            '.MuiOutlinedInput-input',
          ) as HTMLInputElement
        ).focus();
      }
    },
    { preventDefault: true },
    [location.hash, isMdUpBreakpoint],
  );

  useHotkeys(
    'escape',
    () => {
      const searchNotesInputRoot = searchNotesInputRootRef.current;

      if (isMdUpBreakpoint && searchNotesInputRoot && location.hash === '') {
        (
          searchNotesInputRoot.querySelector(
            '.MuiOutlinedInput-input',
          ) as HTMLInputElement
        ).blur();
      }
    },
    { enableOnFormTags: ['input'] },
    [location.hash, isMdUpBreakpoint],
  );

  const [anchorSelectionBtnElem, setAnchorSelectionBtnElem] =
    useState<null | HTMLElement>(null);

  const handleOpenSelectionMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorSelectionBtnElem(event.currentTarget);
  };

  const handleCloseSelectionMenu = () => {
    setAnchorSelectionBtnElem(null);
  };

  const selectionNotesCtx = useSelectionNotesCtx();

  const isSelectedActiveNotes =
    selectionNotesCtx.notes.filter((n) => n.noteStatus === 'active').length > 0;

  const isSelectedArchivedNotes =
    selectionNotesCtx.notes.filter((n) => n.noteStatus === 'archived').length >
    0;

  const isSelectedTrashedNotes =
    selectionNotesCtx.notes.filter((n) => n.isTrashed).length > 0;

  const totalSelectionNotes = selectionNotesCtx.notes.length;

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
        totalSelectionNotes > 1
          ? `${totalSelectionNotes} notes archived`
          : 'Note archived';
      alertTextError =
        totalSelectionNotes > 1
          ? `Archiving${totalSelectionNotes} notes failed`
          : 'Archiving note failed';
    } else if (actionName === 'unarchive') {
      alertTextSuccess =
        totalSelectionNotes > 1
          ? `${totalSelectionNotes} notes unarchive`
          : 'Note unarchive';
      alertTextError =
        totalSelectionNotes > 1
          ? `Unarchiving ${totalSelectionNotes} notes failed`
          : 'Unarchive note failed';
    } else if (actionName === 'trash') {
      alertTextSuccess =
        totalSelectionNotes > 1
          ? `${totalSelectionNotes} notes trashed`
          : 'Note trashed';
      alertTextError =
        totalSelectionNotes > 1
          ? `Trashing ${totalSelectionNotes} notes failed`
          : 'Trashing note failed';
    } else {
      alertTextSuccess =
        totalSelectionNotes > 1
          ? `${totalSelectionNotes} notes restored`
          : 'Note restored';
      alertTextError =
        totalSelectionNotes > 1
          ? `Restoring ${totalSelectionNotes} notes failed`
          : 'Restoring note failed';
    }

    try {
      if (actionName === 'archive' || actionName === 'unarchive') {
        await Promise.all(
          selectionNotesCtx.notes.map((n) =>
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
          selectionNotesCtx.notes.map((n) =>
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

    selectionNotesCtx.unselectAll();

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
        selectionNotesCtx.notes.map((n) => n.noteId),
      );

      emitSnackbarAlert({
        alertText:
          totalSelectionNotes > 1
            ? `${totalSelectionNotes} notes deleted`
            : 'Note deleted',
        alertSeverity: 'success',
      });
    } catch {
      emitSnackbarAlert({
        alertText:
          totalSelectionNotes > 1
            ? `Deleting ${totalSelectionNotes} notes failed`
            : 'Deleting note failed',
        alertSeverity: 'error',
      });
    }

    setCloseDialogDeleteSelectedNotes();

    selectionNotesCtx.unselectAll();

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
    <Box
      data-component="app-top-bar"
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
      {totalSelectionNotes > 0 && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={{
                xs: 1,
                md: 2,
              }}
            >
              <ButtonBase
                onClick={selectionNotesCtx.unselectAll}
                sx={{
                  borderRadius: '100%',
                  p: 2,
                  height: 'max-content',
                  width: 'max-content',
                  transition: 'background-color 150ms ease',
                  '&:hover, &.Mui-focusVisible': {
                    backgroundColor: 'grey.200',
                  },
                }}
              >
                <XIcon />{' '}
                <Typography className="sr-only">Clear all selection</Typography>
              </ButtonBase>
              <Typography variant="h6" component="p">
                {totalSelectionNotes} selected
              </Typography>
            </Stack>
            <ButtonBase
              aria-controls={
                anchorSelectionBtnElem ? 'selection-actions-menu' : undefined
              }
              aria-haspopup="true"
              aria-expanded={anchorSelectionBtnElem ? 'true' : undefined}
              sx={{
                borderRadius: '100%',
                p: 2,
                height: 'max-content',
                width: 'max-content',
                transition: 'background-color 150ms ease',
                '&:hover, &.Mui-focusVisible': {
                  backgroundColor: 'grey.200',
                },
              }}
              onClick={handleOpenSelectionMenu}
            >
              <EllipsisVerticalIcon />{' '}
              <Typography className="sr-only">Selection menu</Typography>
            </ButtonBase>
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
              totalSelectionNotes > 1
                ? `The ${totalSelectionNotes} notes will be permanently deleted`
                : 'The note will be permanently deleted.'
            }
            slotProps={{
              rootDialog: {
                open: isOpenDialogDeleteSelectedNotes,
                onClose: handleCloseDialogDeleteSelectedNotes,
                'aria-labelledby': 'alert-dialog-delete-selected-note-title',
                'aria-describedby':
                  'alert-dialog-delete-selected-note-description',
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
      )}
      {totalSelectionNotes < 1 && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 1,
            sm: 2,
          }}
          sx={{
            height: '100%',
            width: '100%',
          }}
        >
          <div>
            <ButtonBase
              data-component="sidebar-toggler"
              onClick={handleToggleSidebar}
              sx={{
                borderRadius: '100%',
                p: 2,
                transition: 'background-color 150ms ease',
                '&:hover, &.Mui-focusVisible': {
                  backgroundColor: 'grey.200',
                },
              }}
            >
              <MenuIcon />{' '}
              <Typography
                className="sr-only"
                sx={(theme) => ({
                  [theme.breakpoints.down('md')]: {
                    display: 'none',
                  },
                })}
              >
                {isShowSidebar ? 'Minimize the sidebar' : 'Expand the sidebar'}
              </Typography>
              <Typography
                className="sr-only"
                sx={(theme) => ({
                  [theme.breakpoints.up('md')]: {
                    display: 'none',
                  },
                })}
              >
                {isShowSidebar ? 'Hide the sidebar' : 'Show the sidebar'}
              </Typography>
            </ButtonBase>
          </div>
          <Box
            sx={{
              display: {
                xs: 'none',
                sm: 'block',
              },
            }}
          >
            <AppBrandLogo />
          </Box>
          <Box
            sx={{
              flex: 1,
            }}
          >
            <OutlinedInput
              placeholder={isMdUpBreakpoint ? 'Search [ / ]' : 'Search'}
              ref={searchNotesInputRootRef}
              defaultValue={searchNotesQuery}
              onChange={handleSearchNotes}
              sx={{
                maxWidth: '75ch',
              }}
              fullWidth
            />
          </Box>
          <UserMenu
            isSigningOut={isSigningOut}
            isSignedOut={isSignedOut}
            session={session}
            handleSignOut={handleSignOut}
          />
        </Stack>
      )}
    </Box>
  );
}
