import NotesSelectionCtxProvider from '~/contexts/NotesSelectionCtxProvider';
import NotesPageLayoutContent from './_components/NotePageLayoutContent/NotePageLayoutContent';

export default function NotesPageLayout() {
  return (
    <NotesSelectionCtxProvider>
      <NotesPageLayoutContent />
    </NotesSelectionCtxProvider>
  );
}
