import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';
import type { TSuccessResponse } from '~/types/http';
import type { TUserSession } from '~/types/models/auth';

const useSigninWithEmail = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: Readonly<{
        email: string;
        password: string;
      }>,
    ) => {
      try {
        const response = await axiosInstance.post(
          `${envConfig.api.baseUrl}/auth/sign-in/email`,
          payload,
          {
            withCredentials: true,
          },
        );

        const { user } = (
          response.data as TSuccessResponse<{
            user: TUserSession;
          }>
        ).data;

        return { data: user };
      } catch (error) {
        if (
          isAxiosError<{
            error: { message: string };
          }>(error)
        ) {
          throw new Error(error.response?.data.error.message);
        } else {
          throw new Error('Failed to sign in');
        }
      }
    },
  });

  return mutation;
};

export default useSigninWithEmail;
