import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import ResponseError from '~/exceptions/responseError';

import axiosInstance from '~/lib/http';
import type { TErrorResponse, TSuccessResponse } from '~/types/http';
import type { TNoteSimpleResponse } from '~/types/models/notes';

const useGetNotes = ({
  filters: { search, status = {} } = {},
  queryOptions = {},
}: Readonly<{
  filters?: {
    search?: string;
    status?: {
      isActive?: boolean;
      isArchived?: boolean;
      isTrashed?: boolean;
    };
  };
  queryOptions?: {
    enabled?: boolean;
    refetchOnMount?: boolean | 'always';
  };
}> = {}) => {
  const queried = useQuery({
    queryKey: [
      'notes',
      {
        search,
        isActive: status.isActive ?? false,
        isArchived: status.isArchived ?? false,
        isTrashed: status.isTrashed ?? false,
      },
    ],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();

        queryParams.set('search', search ?? '');
        queryParams.set('is_active', status.isActive ? 'true' : 'false');
        queryParams.set('is_archived', status.isArchived ? 'true' : 'false');
        queryParams.set('is_trashed', status.isTrashed ? 'true' : 'false');

        const response = await axiosInstance.get(
          `/notes?${queryParams.toString()}`,
          {
            withCredentials: true,
          },
        );

        return (
          response.data as TSuccessResponse<{
            notes: {
              active: TNoteSimpleResponse[];
              archived: TNoteSimpleResponse[];
              trash: TNoteSimpleResponse[];
            };
          }>
        ).data;
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

        throw new Error('Failed to fetch notes');
      }
    },
    enabled: queryOptions.enabled,
    refetchOnMount: queryOptions.refetchOnMount,
  });

  return queried;
};

export default useGetNotes;
