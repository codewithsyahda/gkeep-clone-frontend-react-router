import { useMutation } from '@tanstack/react-query';
import { delay } from 'msw';

import ResponseError from '~/exceptions/responseError';
import { NotesDB } from '~/tests/mocks/apis/fakeDB/notes';

const useDeleteNoteById = () => {
  const mutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (noteId.trim() === '')
        throw new Error('Note ID must be valid and non empty string value');

      await delay('real');

      const userId = window.sessionStorage.getItem('auth.user_id');

      if (!userId) {
        throw new ResponseError({
          status: 401,
          message: 'Authentication is required.',
          errors: {},
        });
      }

      const notes = NotesDB.getAll();

      const targetedNoteIdx = notes.findIndex(
        (n) => n.id === noteId && n.authorId === userId && n.trashedAt !== null,
      );

      if (targetedNoteIdx) {
        notes.splice(targetedNoteIdx, 1);
        NotesDB.update(notes);
      }

      return null;
    },
  });

  return mutation;
};

export default useDeleteNoteById;
