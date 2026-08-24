import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import SigninPageContent from './_components/SigninPageContent';

import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Sign in | Notes App' },
    { name: 'description', content: 'The Notes App sign-in page' },
  ];
}

const useSession = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSession')
    : import('~/hooks/react-query/auth/useSession'))
).default;

export default function SigninPage() {
  const session = useSession();

  const sessionData = session.data?.session;

  const navigate = useNavigate();

  useEffect(() => {
    if (!session.isPending && sessionData) {
      const redirect = async () => {
        const firstName = sessionData.name.split(' ')[0];

        await navigate('/', { replace: true });

        emitSnackbarAlert({
          alertText: `Welcome back, ${firstName}!`,
        });
      };

      redirect();
    }
  }, [navigate, session.isPending, sessionData]);

  if (session.isPending || sessionData) return null;

  return <SigninPageContent />;
}
