import { useQuery } from '@tanstack/react-query';

import { authClient } from '~/lib/auth';

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
    queryFn: async ({ signal }) => {
      const session = await authClient.getSession({
        fetchOptions: {
          signal,
          credentials: 'include',
        },
      });

      if (session.data) {
        return {
          session: session.data.user,
        };
      }

      throw new Error(session.error?.message);
    },
    retry: queryOptions.retry,
  });

  return queried;
};

export default useSession;
