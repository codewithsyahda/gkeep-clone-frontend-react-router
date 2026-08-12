import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
import type {
  TMutateNoteRequest,
  TNoteSimpleResponse,
} from '~/types/models/notes';

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

      const response = await axiosInstance.put(
        `/notes/${encodeURIComponent(noteId.trim())}`,
        {
          ...data,
          status: 'active',
        } as Omit<TMutateNoteRequest, 'status'> & {
          status: 'active';
        },
        {
          withCredentials: true,
        },
      );

      return (
        response.data as TSuccessResponse<{
          note: TNoteSimpleResponse;
        }>
      ).data;
    },
  });

  return mutation;
};

export default usePutUnarchiveNoteById;
