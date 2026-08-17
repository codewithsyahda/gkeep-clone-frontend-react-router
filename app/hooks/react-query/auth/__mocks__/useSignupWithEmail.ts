import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { delay } from 'msw';

import envConfig from '~/configs/envs';
import axiosInstance from '~/lib/http';
import { UsersDB, type TUserEntity } from '~/tests/mocks/apis/fakeDB/users';
import type { TSuccessResponse } from '~/types/http';

const useSignupWithEmail = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: Readonly<{
        name: string;
        email: string;
        password: string;
      }>,
    ) => {
      if (
        envConfig.dev.mock.msw ||
        import.meta.env.STORYBOOK === 'true' ||
        import.meta.env.MODE === 'test'
      ) {
        try {
          const response = await axiosInstance.post(
            `${envConfig.api.baseUrl}/auth/sign-up/email`,
            payload,
            {
              withCredentials: true,
            },
          );

          const { user } = (
            response.data as TSuccessResponse<{
              user: Omit<TUserEntity, 'password'>;
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
            throw new Error('Failed to sign up');
          }
        }
      }

      await delay('real');

      const { name, email, password } = payload;

      const sanitizedName = name.trim().replaceAll(/\s+/g, ' ');
      const sanitizedEmail = email.trim().replaceAll(/\s+/g, ' ');

      if (sanitizedName.toLowerCase() === '[test 500]') {
        throw new Error('Failed to create user');
      }

      const users = UsersDB.getAll();

      if (users.some((u) => u.email === sanitizedEmail)) {
        throw new Error('User is already exist');
      }

      const newUser: TUserEntity = {
        id: `id-user-${Date.now()}`,
        name: sanitizedName,
        email: sanitizedEmail,
        password,
        emailVerified: false,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      UsersDB.update([...users, newUser]);

      const { password: _p, ...userResponseData } = newUser;

      return {
        data: userResponseData,
      };
    },
  });

  return mutation;
};

export default useSignupWithEmail;
