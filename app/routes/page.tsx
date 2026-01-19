import type { Route } from './+types/page';
import Welcome from './_components/Welcome';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function HomePage() {
  return <Welcome />;
}
