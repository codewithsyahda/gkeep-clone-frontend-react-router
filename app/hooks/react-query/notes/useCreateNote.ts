import { useMutation } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
import type {
  TCreateNoteRequest,
  TNoteSimpleResponse,
} from '~/types/models/notes';

const useCreateNote = () => {
  const mutation = useMutation({
    mutationFn: async (payload: TCreateNoteRequest) => {
      const response = await axiosInstance.post('/notes', payload, {
        withCredentials: true,
      });

      return response.data as TSuccessResponse<{
        data: TNoteSimpleResponse;
      }>;
    },
  });

  return mutation;
};

export default useCreateNote;
