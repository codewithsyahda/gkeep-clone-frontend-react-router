import { useMutation } from '@tanstack/react-query';
import { delay } from 'msw';

import ResponseError from '~/exceptions/responseError';
import { NotesDB } from '~/tests/mocks/apis/fakeDB/notes';

const useDeleteNotes = () => {
  const mutation = useMutation({
    mutationFn: async () => {
      await delay('real');

      const userId = window.sessionStorage.getItem('auth.user_id');

      if (!userId) {
        throw new ResponseError({
          status: 401,
          message: 'Authentication is required.',
          errors: {},
        });
      }

      NotesDB.update(
        NotesDB.getAll().filter(
          (n) =>
            n.authorId !== userId ||
            (n.authorId === userId && n.trashedAt === null),
        ),
      );

      return null;
    },
  });

  return mutation;
};

export default useDeleteNotes;
