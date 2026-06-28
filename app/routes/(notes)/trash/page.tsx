import TrashNotesPageContent from './_components/TrashedNotesPageContent';

import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Trash | Notes App' },
    { name: 'description', content: 'The Notes App trash notes page' },
  ];
}

export default function TrashNotesPage() {
  return <TrashNotesPageContent />;
}
