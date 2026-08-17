import { useMutation } from '@tanstack/react-query';

import type { TMutateNoteRequest } from '~/types/models/notes';
import putNoteById from './putNoteById';

const usePutUnarchiveNoteById = () => {
  const mutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Omit<TMutateNoteRequest, 'status'>;
    }) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      return putNoteById({
        noteId,
        payload: {
          ...data,
          status: 'active',
        },
      });
    },
  });

  return mutation;
};

export default usePutUnarchiveNoteById;
