import { useQueryClient } from '@tanstack/react-query';
import { Editor, useEditor } from '@tiptap/react';
import { clsx } from 'clsx';
import { Maximize, SaveIcon, XIcon } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import ButtonDialogNoteAction from './_internal-components/ButtonDialogNoteAction';
import DialogNoteActionContainer from './_internal-components/DialogNoteActionContainer';
import DialogNoteEditor from './_internal-components/DialogNoteEditor';

import tiptapConfig from '~/configs/tiptap';
import useCreateNote from '~/hooks/react-query/notes/useCreateNote';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import useDialogFullScreen from './_internal-hooks/useDialogFullScreen';
import useInputTitle from './_internal-hooks/useInputTitle';

function DialogCreateNoteEditor({
  noteEditor,
}: Readonly<{
  noteEditor: Editor;
}>) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createNoteMut = useCreateNote();

  const { titleValue, handleInputTitle } = useInputTitle();
  const { fullScreen, handleToggleFullScreen } = useDialogFullScreen();

  const handleCloseDialog = () => {
    if (createNoteMut.isPending || createNoteMut.isSuccess) return;
    navigate({ hash: '' });
  };

  const handleSaveNote = async () => {
    if (createNoteMut.isPending || createNoteMut.isSuccess) return;

    try {
      await createNoteMut.mutateAsync({
        title: titleValue,
        jsonContent: JSON.stringify(noteEditor.getJSON()),
      });

      await navigate({ hash: '' });

      emitSnackbarAlert({
        alertText: 'Note created',
      });

      queryClient.invalidateQueries({
        queryKey: ['notes', { isActive: true }],
      });
    } catch {
      emitSnackbarAlert({
        alertText: 'Creating note failed',
        alertSeverity: 'error',
      });
    }
  };

  useHotkeys('escape', handleCloseDialog, {
    enableOnFormTags: ['textbox'],
    enableOnContentEditable: true,
  });

  return (
    <DialogNoteEditor
      type="create-note"
      noteEditor={noteEditor}
      fullScreen={fullScreen}
      titleValue={titleValue}
      onInputTitle={handleInputTitle}
      onClose={handleCloseDialog}
      actionSection={
        <DialogNoteActionContainer>
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
                disabled={createNoteMut.isPending || createNoteMut.isSuccess}
                onClick={handleCloseDialog}
              >
                <XIcon className="size-4" />
              </Button>
            </Tooltip>
            <Tooltip title="Save">
              <Button
                variant="outlined"
                loading={createNoteMut.isPending || createNoteMut.isSuccess}
                onClick={handleSaveNote}
              >
                <SaveIcon className="size-4" />
              </Button>
            </Tooltip>
          </Stack>
        </DialogNoteActionContainer>
      }
    />
  );
}

export default function DialogCreateNote() {
  const noteEditor = useEditor({
    extensions: tiptapConfig.extensions,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: clsx(tiptapConfig.defaultStyle, 'pb-80'),
        role: 'textbox',
        'aria-label': 'Content note',
      },
    },
  });

  if (!noteEditor) return null;

  return <DialogCreateNoteEditor noteEditor={noteEditor} />;
}
