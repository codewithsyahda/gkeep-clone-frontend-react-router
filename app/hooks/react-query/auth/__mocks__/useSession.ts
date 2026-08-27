import { isAxiosError } from 'axios';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
import type { TUserSession } from '~/types/models/auth';
import useSessionQuery, { type TUseSessionQueryOpts } from '../useSessionQuery';

const useSession = ({
  queryOptions,
}: Readonly<{
  queryOptions?: TUseSessionQueryOpts;
}> = {}) => {
  const queried = useSessionQuery({
    queryOptions: {
      ...queryOptions,
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
              session: TUserSession;
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
    },
  });

  return queried;
};

export default useSession;
