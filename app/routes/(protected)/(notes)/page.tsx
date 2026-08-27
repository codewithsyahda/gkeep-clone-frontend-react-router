import ActiveNotesPageContent from './_components/ActiveNotesPageContent';

import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Active | Notes App' },
    { name: 'description', content: 'The Notes App active notes page' },
  ];
}

export default function ActiveNotesPage() {
  return <ActiveNotesPageContent />;
}
