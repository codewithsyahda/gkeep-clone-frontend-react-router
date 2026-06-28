import SignupPageContent from './_components/SignupPageContent';

import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Sign up | Notes App' },
    { name: 'description', content: 'The Notes App sign-up page' },
  ];
}

export default function SignupPage() {
  return <SignupPageContent />;
}
