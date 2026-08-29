import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import ResponseError from '~/exceptions/responseError';
import axiosInstance from '~/lib/http';
import type { TErrorResponse, TSuccessResponse } from '~/types/http';
import type { TNoteDetailResponse } from '~/types/models/notes';

const useGetNoteById = ({
  noteId,
  queryOptions = {
    retry: false,
  },
}: Readonly<{
  noteId: string;
  queryOptions?: {
    enabled?: boolean;
    retry?: boolean | number;
    refetchOnMount?: boolean | 'always';
  };
}>) => {
  const queried = useQuery({
    queryKey: ['notes', noteId],
    queryFn: async () => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      try {
        const response = await axiosInstance(
          `/notes/${encodeURIComponent(noteId.trim())}`,
          {
            withCredentials: true,
          },
        );

        return (
          response.data as TSuccessResponse<{
            note: TNoteDetailResponse;
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

        throw new Error('Failed to fetch note');
      }
    },
    enabled: queryOptions.enabled,
    retry: queryOptions.retry,
    refetchOnMount: queryOptions.refetchOnMount,
  });

  return queried;
};

export default useGetNoteById;
