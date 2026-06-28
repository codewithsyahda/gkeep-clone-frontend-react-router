import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
import type {
  TMutateNoteRequest,
  TNoteSimpleResponse,
} from '~/types/models/notes';

const usePutRestoreNoteById = () => {
  const mutation = useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string;
      data: Omit<TMutateNoteRequest, 'isTrashed'>;
    }) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      const response = await axiosInstance.put(
        `/notes/${encodeURIComponent(noteId.trim())}`,
        {
          ...data,
          isTrashed: false,
        } as Omit<TMutateNoteRequest, 'isTrashed'> & {
          isTrashed: false;
        },
        {
          withCredentials: true,
        },
      );

      return response.data as TSuccessResponse<{
        note: TNoteSimpleResponse;
      }>;
    },
  });

  return mutation;
};

export default usePutRestoreNoteById;
