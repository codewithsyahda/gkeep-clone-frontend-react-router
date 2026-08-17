import { useMutation } from '@tanstack/react-query';

import type { TMutateNoteRequest } from '~/types/models/notes';
import patchNoteById from './patchNoteById';

const usePatchContentNoteById = () => {
  const mutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Omit<TMutateNoteRequest, 'status' | 'isTrashed'>;
    }) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      return patchNoteById({
        noteId,
        payload: {
          ...data,
        },
      });
    },
  });

  return mutation;
};

export default usePatchContentNoteById;
