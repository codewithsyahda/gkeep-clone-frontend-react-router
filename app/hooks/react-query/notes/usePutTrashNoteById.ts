import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import ResponseError from '~/exceptions/responseError';
import axiosInstance from '~/lib/http';
import type { TErrorResponse, TSuccessResponse } from '~/types/http';
import type {
  TMutateNoteRequest,
  TNoteSimpleResponse,
} from '~/types/models/notes';

const usePutTrashNoteById = () => {
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

      try {
        const response = await axiosInstance.put(
          `/notes/${encodeURIComponent(noteId.trim())}`,
          {
            ...data,
            isTrashed: true,
          } as Omit<TMutateNoteRequest, 'isTrashed'> & {
            isTrashed: true;
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
      } catch (error) {
        console.error(error);

        if (isAxiosError(error) && error.response) {
          const errData = error.response.data as TErrorResponse<object>;

          throw new ResponseError({
            status: errData.status,
            errors: errData.errors,
            message: errData.detail,
          });
        }

        throw new Error('Failed to trash note');
      }
    },
  });

  return mutation;
};

export default usePutTrashNoteById;
