import { useQuery } from '@tanstack/react-query';

import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
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
  type TData = {
    notes: {
      active: TNoteSimpleResponse[];
      archived: TNoteSimpleResponse[];
      trash: TNoteSimpleResponse[];
    };
  };

  const queried = useQuery<TData>({
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

      return (response.data as TSuccessResponse<TData>).data;
    },
    enabled: queryOptions.enabled,
    refetchOnMount: queryOptions.refetchOnMount,
  });

  return queried;
};

export default useGetNotes;
