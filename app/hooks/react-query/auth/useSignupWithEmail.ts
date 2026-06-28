import { useMutation } from '@tanstack/react-query';

import { authClient } from '~/lib/auth';

const useSignupWithEmail = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: Readonly<{
        name: string;
        email: string;
        password: string;
      }>,
    ) => {
      const signedUp = await authClient.signUp.email({
        ...payload,
        fetchOptions: {
          credentials: 'include',
        },
      });

      if (signedUp.data) {
        return {
          data: signedUp.data.user,
        };
      }

      throw new Error(signedUp.error.message);
    },
  });

  return mutation;
};

export default useSignupWithEmail;
