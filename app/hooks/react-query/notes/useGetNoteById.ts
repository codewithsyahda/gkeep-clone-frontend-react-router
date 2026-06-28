import { useQuery } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
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
    },
    enabled: queryOptions.enabled,
    retry: queryOptions.retry,
    refetchOnMount: queryOptions.refetchOnMount,
  });

  return queried;
};

export default useGetNoteById;
