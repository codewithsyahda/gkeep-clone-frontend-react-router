import { useMutation } from '@tanstack/react-query';
import { delay } from 'msw';

import ResponseError from '~/exceptions/responseError';
import { NotesDB } from '~/tests/mocks/apis/fakeDB/notes';

const useDeleteNoteByIds = () => {
  const mutation = useMutation({
    mutationFn: async (noteIds: string[]) => {
      await delay('real');

      const userId = window.sessionStorage.getItem('auth.user_id');

      if (!userId) {
        throw new ResponseError({
          status: 401,
          message: 'Authentication is required.',
          errors: {},
        });
      }

      noteIds.forEach((noteId) =>
        NotesDB.update(
          NotesDB.getAll().filter(
            (n) =>
              n.authorId !== userId ||
              (n.authorId === userId && n.trashedAt === null) ||
              (n.authorId === userId &&
                n.trashedAt !== null &&
                n.id !== noteId),
          ),
        ),
      );

      return null;
    },
  });

  return mutation;
};

export default useDeleteNoteByIds;
