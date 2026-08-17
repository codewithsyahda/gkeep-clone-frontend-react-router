import { useMutation } from '@tanstack/react-query';

import type { TMutateNoteRequest } from '~/types/models/notes';
import putNoteById from './putNoteById';

const usePutNoteById = () => {
  const mutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: TMutateNoteRequest;
    }) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      return putNoteById({ noteId, payload: data });
    },
  });

  return mutation;
};

export default usePutNoteById;
