import { useMutation } from '@tanstack/react-query';

import { authClient } from '~/lib/auth';

const useSignout = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      const signedOut = await authClient.signOut({
        fetchOptions: {
          credentials: 'include',
        },
      });

      if (signedOut.data) {
        return {
          success: signedOut.data.success,
        };
      }

      throw new Error(signedOut.error.message);
    },
  });

  return mutation;
};

export default useSignout;
