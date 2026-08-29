import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import ResponseError from '~/exceptions/responseError';
import axiosInstance from '~/lib/http';
import type { TErrorResponse } from '~/types/http';

const useDeleteNotes = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      try {
        await axiosInstance.delete('/notes', {
          withCredentials: true,
        });

        return null;
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

        throw new Error('Failed to delete notes');
      }
    },
  });

  return mutation;
};

export default useDeleteNotes;
