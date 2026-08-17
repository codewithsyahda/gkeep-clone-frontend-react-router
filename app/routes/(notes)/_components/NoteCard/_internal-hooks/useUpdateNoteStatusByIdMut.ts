import { useQueryClient } from '@tanstack/react-query';
import { type MouseEvent } from 'react';

import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import type { TMutateNoteActions, TNoteStatus } from '~/types/models/notes';

const usePatchNoteById = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/notes/__mocks__/usePatchNoteById')
    : import('~/hooks/react-query/notes/usePatchNoteById'))
).default;

const useUpdateNoteByIdMut = (noteId: string) => {
  const queryClient = useQueryClient();
  const patchNoteMut = usePatchNoteById();

  const handleUpdateNote = async (ev: MouseEvent<HTMLButtonElement>) => {
    if (patchNoteMut.isPending || patchNoteMut.isSuccess) return;

    const action = ev.currentTarget.dataset.action as Exclude<
      TMutateNoteActions,
      'update-data'
    >;

    let statusNote: TNoteStatus | undefined;
    let alertTextSuccess = '';
    let alertTextError = '';
    let undoStatusNote: TNoteStatus;
    let isTrashed: boolean | undefined;
    let undoIsTrashed: boolean | undefined;

    if (action === 'archive') {
      statusNote = 'archived';
      alertTextSuccess = 'Note archived';
      alertTextError = 'Archiving note failed';
      undoStatusNote = 'active';
    } else if (action === 'unarchive') {
      statusNote = 'active';
      alertTextSuccess = 'Note unarchive';
      alertTextError = 'Unarchive note failed';
      undoStatusNote = 'archived';
    } else if (action === 'trash') {
      alertTextSuccess = 'Note trashed';
      alertTextError = 'Trashing note failed';
      isTrashed = true;
      undoIsTrashed = false;
    } else {
      alertTextSuccess = 'Note restored';
      alertTextError = 'Restoring note failed';
      isTrashed = false;
      undoIsTrashed = true;
    }

    try {
      await patchNoteMut.mutateAsync({
        noteId,
        data: {
          status: statusNote,
          isTrashed,
        },
      });

      emitSnackbarAlert({
        alertText: alertTextSuccess,
        undoActionFn: async () => {
          try {
            await patchNoteMut.mutateAsync({
              noteId,
              data: {
                status: undoStatusNote,
                isTrashed: undoIsTrashed,
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

      queryClient.invalidateQueries({
        queryKey: ['notes'],
      });
    } catch {
      emitSnackbarAlert({
        alertText: alertTextError,
        alertSeverity: 'error',
      });
    }
  };

  return {
    patchNoteMut,
    handleUpdateNote,
  };
};

export default useUpdateNoteByIdMut;
