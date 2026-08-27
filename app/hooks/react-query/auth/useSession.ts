import { authClient } from '~/lib/auth';
import useSessionQuery, { type TUseSessionQueryOpts } from './useSessionQuery';

const useSession = ({
  queryOptions,
}: Readonly<{
  queryOptions?: TUseSessionQueryOpts;
}> = {}) => {
  const queried = useSessionQuery({
    queryOptions: {
      ...queryOptions,
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
    },
  });

  return queried;
};

export default useSession;
