import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

import emitSnackbarAlert from '../_helpers/snackbarAlert';

const useSession = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSession')
    : import('~/hooks/react-query/auth/useSession'))
).default;

export default function ProtectedLayout() {
  const session = useSession({
    queryOptions: {
      refetchInterval: 1000 * 60 * 60 * 24, // Refetch everyday
    },
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (session.isFetchedAfterMount && session.isError) {
      navigate('/signin', { replace: true });

      emitSnackbarAlert({
        alertText: 'Please sign-in first',
        alertSeverity: 'error',
      });
    }
  }, [navigate, session.isError, session.isFetchedAfterMount]);

  if (!session.isFetchedAfterMount || session.isError) return null;

  return <Outlet />;
}
