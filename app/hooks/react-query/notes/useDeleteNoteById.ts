import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import ResponseError from '~/exceptions/responseError';
import axiosInstance from '~/lib/http';
import type { TErrorResponse } from '~/types/http';

const useDeleteNoteById = () => {
  const mutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      try {
        await axiosInstance.delete(`/notes/${encodeURIComponent(noteId)}`, {
          withCredentials: true,
        });

        return null;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        if (isAxiosError(error) && error.response) {
          const errData = error.response.data as TErrorResponse<object>;

          throw new ResponseError({
            status: errData.status,
            errors: errData.errors,
            message: errData.detail,
          });
        }

        throw new Error('Failed to delete note');
      }
    },
  });

  return mutation;
};

export default useDeleteNoteById;
