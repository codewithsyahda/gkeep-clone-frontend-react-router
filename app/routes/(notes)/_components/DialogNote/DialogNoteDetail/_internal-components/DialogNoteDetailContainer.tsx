import { useTheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { Editor } from '@tiptap/react';
import { useEffect, useRef, type MouseEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';

import DialogNoteDetailNonTrashed from './DialogNoteDetailNonTrashed';
import DialogNoteDetailTrashed from './DialogNoteDetailTrashed';

import BadRequestError from '~/exceptions/badRequestError';
import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import type { TNoteStatus } from '~/types/models/notes';
import useInputTitle from '../../_internal-hooks/useInputTitle';

const usePatchContentNoteById = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/usePatchContentNoteById')
    : import('~/hooks/react-query/notes/usePatchContentNoteById'))
).default;

const usePatchNoteById = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/usePatchNoteById')
    : import('~/hooks/react-query/notes/usePatchNoteById'))
).default;

const usePutArchiveNoteById = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/usePutArchiveNoteById')
    : import('~/hooks/react-query/notes/usePutArchiveNoteById'))
).default;

const usePutTrashNoteById = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/usePutTrashNoteById')
    : import('~/hooks/react-query/notes/usePutTrashNoteById'))
).default;

const usePutUnarchiveNoteById = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/usePutUnarchiveNoteById')
    : import('~/hooks/react-query/notes/usePutUnarchiveNoteById'))
).default;

export default function DialogNoteDetailContainer({
  noteEditor,
  noteId,
  noteTitle,
  noteStatus,
  isTrashed,
  updatedAt,
}: Readonly<{
  noteEditor: Editor;
  noteId: string;
  noteTitle: string;
  noteStatus: TNoteStatus;
  isTrashed: boolean;
  updatedAt: string;
}>) {
  const putArchiveNoteMut = usePutArchiveNoteById();
  const putUnarchiveNoteMut = usePutUnarchiveNoteById();
  const putTrashNoteMut = usePutTrashNoteById();

  const patchContentNoteById = usePatchContentNoteById();
  const patchNoteMut = usePatchNoteById();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const searchNotesQuery = searchParams.get('search-notes') || '';

  const handleCloseDialog = async () => {
    if (patchContentNoteById.isPending) return;

    navigate({
      hash: '',
      search: searchNotesQuery
        ? `?search-notes=${encodeURIComponent(searchNotesQuery)}`
        : '',
    });
  };

  const updateContentNoteResetTm =
    useRef<ReturnType<typeof window.setTimeout>>(null);

  const handleUpdateContentNote = async () => {
    if (patchContentNoteById.isPending) return;

    if (titleValue.length > 128) {
      throw new BadRequestError('Title must not more than 128 chars');
    }

    try {
      await patchContentNoteById.mutateAsync({
        noteId,
        data: {
          title: titleValue,
          jsonContent: JSON.stringify(noteEditor.getJSON()),
        },
      });

      queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
    } catch (error) {
      let alertText: string;

      if (error instanceof BadRequestError) {
        alertText = error.message;
      } else {
        alertText = 'Updating note failed';
      }

      emitSnackbarAlert({
        alertText,
        alertSeverity: 'error',
      });
    } finally {
      if (updateContentNoteResetTm.current)
        clearTimeout(updateContentNoteResetTm.current);

      updateContentNoteResetTm.current = setTimeout(() => {
        patchContentNoteById.reset();
      }, 3000);
    }
  };

  const queryClient = useQueryClient();
  const muiTheme = useTheme();

  const { titleValue, handleInputTitle } = useInputTitle(noteTitle);

  const handleUpdateNonContentNote = async (
    ev: MouseEvent<HTMLButtonElement>,
  ) => {
    const action = ev.currentTarget.dataset.updateNonContentAction as
      | 'archive'
      | 'unarchive'
      | 'trash'
      | 'restore';

    try {
      const updateStatusNotePayload = {
        noteId,
        data: {
          title: titleValue,
          jsonContent: JSON.stringify(noteEditor.getJSON()),
          isTrashed: isTrashed,
        },
      };

      if (action === 'archive') {
        await putArchiveNoteMut.mutateAsync(updateStatusNotePayload);
      } else if (action === 'unarchive') {
        await putUnarchiveNoteMut.mutateAsync(updateStatusNotePayload);
      } else if (action === 'trash') {
        await putTrashNoteMut.mutateAsync({
          noteId,
          data: {
            title: titleValue,
            jsonContent: JSON.stringify(noteEditor.getJSON()),
            status: noteStatus,
          },
        });
      } else {
        await patchNoteMut.mutateAsync({
          noteId,
          data: {
            isTrashed: false,
          },
        });
      }

      queryClient.invalidateQueries({
        queryKey: ['notes'],
      });

      if (
        document.documentElement.clientWidth <= muiTheme.breakpoints.values.sm
      )
        return;

      await navigate({
        hash: '',
        search: searchNotesQuery
          ? `?search-notes=${encodeURIComponent(searchNotesQuery)}`
          : '',
      });

      let alertText: string;
      let undoUpdatedStatus = noteStatus;
      let undoUpdatedIsTrashed = isTrashed;

      if (action === 'archive') {
        alertText = 'Note archived';
        undoUpdatedStatus = 'active';
      } else if (action === 'unarchive') {
        alertText = 'Note unarchive';
        undoUpdatedStatus = 'archived';
      } else if (action === 'trash') {
        alertText = 'Note trashed';
        undoUpdatedIsTrashed = false;
      } else {
        alertText = 'Note restored';
        undoUpdatedIsTrashed = true;
      }

      emitSnackbarAlert({
        alertText,
        async undoActionFn() {
          try {
            await patchNoteMut.mutateAsync({
              noteId,
              data: {
                status: undoUpdatedStatus,
                isTrashed: undoUpdatedIsTrashed,
              },
            });

            emitSnackbarAlert({
              alertText: 'Action undone',
              alertSeverity: 'info',
            });

            queryClient.invalidateQueries({
              queryKey: ['notes'],
            });
          } catch {
            emitSnackbarAlert({
              alertText: 'Action undone failed',
              alertSeverity: 'error',
            });
          }
        },
      });
    } catch {
      let alertText = '';

      switch (action) {
        case 'archive':
          alertText = 'Archiving note failed';
          break;
        case 'unarchive':
          alertText = 'Unarchive note failed';
          break;
        case 'trash':
          alertText = 'Trashing note failed';
          break;
        case 'restore':
          alertText = 'Restoring note failed';
          break;
      }

      emitSnackbarAlert({
        alertText,
        alertSeverity: 'error',
      });
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (
      searchNotesQuery ||
      putArchiveNoteMut.isSuccess ||
      putUnarchiveNoteMut.isSuccess ||
      putTrashNoteMut.isSuccess ||
      patchNoteMut.isSuccess ||
      document.documentElement.clientWidth <= muiTheme.breakpoints.values.sm
    )
      return;

    if (noteStatus === 'active' && location.pathname !== '/') {
      navigate({
        pathname: '/',
        hash: `#notes/${noteId}`,
      });
    }

    if (noteStatus === 'archived' && location.pathname !== '/archive') {
      navigate({
        pathname: '/archive',
        hash: `#notes/${noteId}`,
      });
    }

    if (isTrashed && location.pathname !== '/archive') {
      navigate({
        pathname: '/trash',
        hash: `#notes/${noteId}`,
      });
    }
  }, [
    isTrashed,
    location.pathname,
    muiTheme.breakpoints.values.sm,
    navigate,
    noteId,
    noteStatus,
    patchNoteMut.isSuccess,
    putArchiveNoteMut.isSuccess,
    putTrashNoteMut.isSuccess,
    putUnarchiveNoteMut.isSuccess,
    searchNotesQuery,
  ]);

  useEffect(() => {
    if (isTrashed) {
      noteEditor.setEditable(false);
    } else {
      noteEditor.setEditable(true);
    }
  }, [isTrashed, noteEditor]);

  if (isTrashed) {
    return (
      <DialogNoteDetailTrashed
        noteEditor={noteEditor}
        isRestoringNote={
          patchNoteMut.isPending && !patchNoteMut.variables.data.isTrashed
        }
        titleValue={titleValue}
        noteId={noteId}
        noteStatus={noteStatus}
        isTrashed={isTrashed}
        updatedAt={updatedAt}
        handleUpdateNonContentNote={handleUpdateNonContentNote}
        handleCloseDialog={handleCloseDialog}
      />
    );
  }

  return (
    <DialogNoteDetailNonTrashed
      noteEditor={noteEditor}
      isUpdatingContentNote={patchContentNoteById.isPending}
      isUpdatedContentNote={patchContentNoteById.isSuccess}
      isArchivingNote={putArchiveNoteMut.isPending}
      isUnarchiveNote={putUnarchiveNoteMut.isPending}
      isTrashingNote={putTrashNoteMut.isPending}
      titleValue={titleValue}
      noteStatus={noteStatus}
      isTrashed={isTrashed}
      updatedAt={updatedAt}
      handleInputTitle={handleInputTitle}
      handleUpdateContentNote={handleUpdateContentNote}
      handleUpdateNonContentNote={handleUpdateNonContentNote}
      handleCloseDialog={handleCloseDialog}
    />
  );
}
