import SigninPageContent from './_components/SigninPageContent';

import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Sign in | Notes App' },
    { name: 'description', content: 'The Notes App sign-in page' },
  ];
}

export default function SigninPage() {
  return <SigninPageContent />;
}
