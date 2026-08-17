import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { delay } from 'msw';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';

const useSignout = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      if (
        envConfig.dev.mock.msw ||
        import.meta.env.STORYBOOK === 'true' ||
        import.meta.env.MODE === 'test'
      ) {
        try {
          await axiosInstance.post(`${envConfig.api.baseUrl}/auth/sign-out`, {
            withCredentials: true,
          });

          return {
            success: true,
          };
        } catch (error) {
          if (isAxiosError(error)) {
            throw new Error(error.message);
          } else {
            throw new Error('Failed to sign out');
          }
        }
      }

      await delay('real');

      window.sessionStorage.removeItem('auth.user_id');

      return {
        success: true,
      };
    },
  });

  return mutation;
};

export default useSignout;
