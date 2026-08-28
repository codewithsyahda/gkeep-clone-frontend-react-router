import { Editor } from '@tiptap/react';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  CheckIcon,
  Maximize,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import { type MouseEventHandler } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Spinner from '~/components/Spinner';
import ButtonDialogNoteAction from '../../_internal-components/ButtonDialogNoteAction';
import DialogNoteActionContainer from '../../_internal-components/DialogNoteActionContainer';
import DialogNoteEditor from '../../_internal-components/DialogNoteEditor';
import ButtonNoteInfo from './ButtonNoteInfo';
import DialogNoteDetailInfo from './DialogNoteDetailInfo';

import useBoolean from '~/hooks/useBoolean';
import type { TNoteStatus } from '~/types/models/notes';
import formatDate from '~/utils/formatDate';
import useDialogFullScreen from '../../_internal-hooks/useDialogFullScreen';

export default function DialogNoteDetailNonTrashed({
  noteEditor,
  isUpdatingContentNote,
  isUpdatedContentNote,
  isArchivingNote,
  isUnarchiveNote,
  isTrashingNote,
  noteStatus,
  isTrashed,
  updatedAt,
  titleValue,
  handleInputTitle,
  handleUpdateContentNote,
  handleUpdateNonContentNote,
  handleCloseDialog,
}: Readonly<{
  noteEditor: Editor;
  isUpdatingContentNote: boolean;
  isUpdatedContentNote: boolean;
  isArchivingNote: boolean;
  isUnarchiveNote: boolean;
  isTrashingNote: boolean;
  noteStatus: TNoteStatus;
  isTrashed: boolean;
  updatedAt: string;
  titleValue: string;
  handleInputTitle: (value: string) => void;
  handleUpdateContentNote: MouseEventHandler<HTMLButtonElement>;
  handleUpdateNonContentNote: MouseEventHandler<HTMLButtonElement>;
  handleCloseDialog: MouseEventHandler<HTMLButtonElement>;
}>) {
  const { fullScreen, handleToggleFullScreen } = useDialogFullScreen();

  const {
    value: isOpenInfo,
    toggleValue: handleToggleOpenInfo,
    setFalse: setOpenInfoFalse,
  } = useBoolean(false);

  const isUpdatingNote =
    isUpdatingContentNote ||
    isArchivingNote ||
    isUnarchiveNote ||
    isTrashingNote;

  return (
    <DialogNoteEditor
      type="detail-note"
      noteEditor={noteEditor}
      fullScreen={fullScreen}
      titleValue={titleValue}
      onInputTitle={handleInputTitle}
      onClose={handleCloseDialog}
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
            {noteStatus === 'active' && (
              <ButtonDialogNoteAction
                data-update-non-content-action="archive"
                tooltipTitle="Archive"
                disabled={isUpdatingNote}
                onClick={handleUpdateNonContentNote}
              >
                {isArchivingNote ? (
                  <Spinner />
                ) : (
                  <ArchiveIcon className="size-4" />
                )}
              </ButtonDialogNoteAction>
            )}
            {noteStatus === 'archived' && (
              <ButtonDialogNoteAction
                data-update-non-content-action="unarchive"
                tooltipTitle="Unarchive"
                disabled={isUpdatingNote}
                onClick={handleUpdateNonContentNote}
              >
                {isUnarchiveNote ? (
                  <Spinner />
                ) : (
                  <ArchiveRestoreIcon className="size-4" />
                )}
              </ButtonDialogNoteAction>
            )}
            <ButtonDialogNoteAction
              data-update-non-content-action="trash"
              tooltipTitle="Trash"
              disabled={isUpdatingNote}
              onClick={handleUpdateNonContentNote}
            >
              {isTrashingNote ? <Spinner /> : <Trash2Icon className="size-4" />}
            </ButtonDialogNoteAction>
            <Chip
              label={noteStatus === 'active' ? 'Active' : 'Archived'}
              color={noteStatus === 'active' ? 'success' : 'default'}
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
                disabled={isUpdatingNote}
                onClick={handleCloseDialog}
              >
                <XIcon className="size-4" />
              </Button>
            </Tooltip>
            <Tooltip title="Update">
              <Button
                variant={'outlined'}
                loading={isUpdatingContentNote}
                disabled={isUpdatingNote || isUpdatedContentNote}
                aria-label={undefined}
                onClick={handleUpdateContentNote}
              >
                {isUpdatingContentNote && (
                  <>
                    <Spinner size={16} />
                    <Typography className="sr-only">Updating note</Typography>
                  </>
                )}
                {!isUpdatingContentNote && !isUpdatedContentNote && (
                  <>
                    <SaveIcon className="size-4" />
                    <Typography className="sr-only">Update note</Typography>
                  </>
                )}
                {isUpdatedContentNote && (
                  <>
                    <CheckIcon className="size-4" />
                    <Typography className="sr-only">Note updated</Typography>
                  </>
                )}
              </Button>
            </Tooltip>
          </Stack>
        </DialogNoteActionContainer>
      }
    />
  );
}
