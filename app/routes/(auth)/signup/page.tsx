import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import SignupPageContent from './_components/SignupPageContent';

import emitSnackbarAlert from '~/routes/_helpers/snackbarAlert';
import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Sign up | Notes App' },
    { name: 'description', content: 'The Notes App sign-up page' },
  ];
}

const useSession = (
  await (import.meta.env.DEV
    ? import('~/hooks/react-query/auth/__mocks__/useSession')
    : import('~/hooks/react-query/auth/useSession'))
).default;

export default function SignupPage() {
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

  return <SignupPageContent />;
}
