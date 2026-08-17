import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { delay } from 'msw';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';
import { UsersDB, type TUserEntity } from '~/tests/mocks/apis/fakeDB/users';
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
      if (
        envConfig.dev.mock.msw ||
        import.meta.env.STORYBOOK === 'true' ||
        import.meta.env.MODE === 'test'
      ) {
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
      }

      await delay('real');

      const users = UsersDB.getAll();

      if (envConfig.dev.mock.auth.signedIn) {
        const { password: _p, ...userResponseData } = users[0];

        return {
          session: userResponseData,
        };
      }

      const user = users.find(
        (u) => u.id === window.sessionStorage.getItem('auth.user_id'),
      );

      if (user) {
        const { password: _p, ...userResponseData } = user;

        return {
          session: userResponseData,
        };
      }

      throw new Error('Please sign in first');
    },
    retry: queryOptions.retry,
  });

  return queried;
};

export default useSession;
