import ArchivedNotesPageContent from './_components/ArchiveNotesPageContent';

import type { Route } from './+types/page';

export function meta(_meta: Route.MetaArgs) {
  return [
    { title: 'Archive | Notes App' },
    { name: 'description', content: 'The Notes App archive notes page' },
  ];
}

export default function ArchivedNotesPage() {
  return <ArchivedNotesPageContent />;
}
