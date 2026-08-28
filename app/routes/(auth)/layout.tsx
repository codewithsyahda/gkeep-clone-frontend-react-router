import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';

import emitSnackbarAlert from '../_helpers/snackbarAlert';

const useSession = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSession')
    : import('~/hooks/react-query/auth/useSession'))
).default;

export default function AuthLayout() {
  const session = useSession();

  const navigate = useNavigate();

  const sessionData = session.data?.session;

  useEffect(() => {
    if (session.isFetchedAfterMount && session.isSuccess && sessionData) {
      const firstName = sessionData.name.split(' ')[0];

      navigate('/', { replace: true });

      emitSnackbarAlert({
        alertText: `Welcome back, ${firstName}!`,
      });
    }
  }, [navigate, session.isFetchedAfterMount, session.isSuccess, sessionData]);

  if (!session.isFetchedAfterMount || session.isSuccess) return null;

  return <Outlet />;
}
