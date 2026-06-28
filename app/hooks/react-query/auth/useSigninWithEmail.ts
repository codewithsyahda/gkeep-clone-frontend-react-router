import { useMutation } from '@tanstack/react-query';

import { authClient } from '~/lib/auth';

const useSigninWithEmail = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: Readonly<{
        email: string;
        password: string;
      }>,
    ) => {
      const signedIn = await authClient.signIn.email({
        ...payload,
        fetchOptions: {
          credentials: 'include',
        },
      });

      if (signedIn.data) {
        return {
          data: signedIn.data.user,
        };
      }

      throw new Error(signedIn.error.message);
    },
  });

  return mutation;
};

export default useSigninWithEmail;
