import SelectionNotesCtxProvider from '~/contexts/SelectionNotesCtxProvider';
import NotesPageLayoutContent from './_components/NotePageLayoutContent/NotePageLayoutContent';

export default function NotesPageLayout() {
  return (
    <SelectionNotesCtxProvider>
      <NotesPageLayoutContent />
    </SelectionNotesCtxProvider>
  );
}
