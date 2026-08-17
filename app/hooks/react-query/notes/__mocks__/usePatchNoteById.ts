import { useMutation } from '@tanstack/react-query';

import type { TMutateNoteRequest } from '~/types/models/notes';
import patchNoteById from './patchNoteById';

const usePatchNoteById = () => {
  const mutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Partial<TMutateNoteRequest>;
    }) => {
      if (noteId.trim() === '') {
        throw new Error('Note ID must be valid and non empty string value');
      }

      const titlePayload = data.title;
      const jsonContentPayload = data.jsonContent;
      const statusPayload = data.status;
      const isTrashedPayload = data.isTrashed;

      if (
        titlePayload === undefined &&
        jsonContentPayload === undefined &&
        statusPayload === undefined &&
        isTrashedPayload === undefined
      ) {
        throw new Error('Must define at least one payload field');
      }

      return patchNoteById({ noteId, payload: data });
    },
  });

  return mutation;
};

export default usePatchNoteById;
