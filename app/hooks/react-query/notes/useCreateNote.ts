import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import ResponseError from '~/exceptions/responseError';
import axiosInstance from '~/lib/http';
import type { TErrorResponse, TSuccessResponse } from '~/types/http';
import type {
  TCreateNoteRequest,
  TNoteSimpleResponse,
} from '~/types/models/notes';

const useCreateNote = () => {
  const mutation = useMutation({
    mutationFn: async (payload: TCreateNoteRequest) => {
      try {
        const response = await axiosInstance.post('/notes', payload, {
          withCredentials: true,
        });

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

        throw new Error('Failed to create note');
      }
    },
  });

  return mutation;
};

export default useCreateNote;
