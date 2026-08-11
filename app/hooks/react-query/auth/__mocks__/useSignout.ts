import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';

const useSignout = () => {
  const mutation = useMutation({
    mutationFn: async () => {
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
    },
  });

  return mutation;
};

export default useSignout;
