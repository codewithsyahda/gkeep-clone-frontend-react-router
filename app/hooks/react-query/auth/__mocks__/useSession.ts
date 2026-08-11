import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';
import { type TUserEntity } from '~/tests/mocks/apis/fakeDB/users';
import type { TSuccessResponse } from '~/types/http';

const useSession = ({
  queryOptions = {
    retry: false,
  },
}: Readonly<{
  queryOptions?: {
    retry?: boolean | number;
  };
}> = {}) => {
  const queried = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get(
          `${envConfig.api.baseUrl}/auth/get-session`,
          {
            withCredentials: true,
          },
        );

        const { session } = (
          response.data as TSuccessResponse<{
            session: Omit<TUserEntity, 'password'>;
          }>
        ).data;

        return { session };
      } catch (error) {
        if (
          isAxiosError<{
            error: { message: string };
          }>(error)
        ) {
          throw new Error(error.response?.data.error.message);
        } else {
          throw new Error('Failed to fetch session');
        }
      }
    },
    retry: queryOptions.retry,
  });

  return queried;
};

export default useSession;
